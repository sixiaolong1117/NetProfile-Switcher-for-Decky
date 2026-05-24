import os
import json
import shlex
import subprocess
import re
from typing import Any

import decky

PROFILES_FILE = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "profiles.json")
NETWORK_CONNECTION_TYPES = {"802-3-ethernet", "802-11-wireless", "ethernet", "wifi"}


def _unescape_nmcli_value(value: str) -> str:
    """Unescape nmcli terse output values enough to pass them back to nmcli."""
    return value.replace(r"\:", ":").replace(r"\\", "\\")


def _load_profiles() -> list[dict[str, Any]]:
    """Load saved network profiles from JSON file."""
    if not os.path.exists(PROFILES_FILE):
        return []
    try:
        with open(PROFILES_FILE, "r") as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
    except (json.JSONDecodeError, IOError) as e:
        decky.logger.error(f"Failed to load profiles: {e}")
    return []


def _save_profiles(profiles: list[dict[str, Any]]) -> bool:
    """Save network profiles to JSON file."""
    try:
        os.makedirs(decky.DECKY_PLUGIN_SETTINGS_DIR, exist_ok=True)
        with open(PROFILES_FILE, "w") as f:
            json.dump(profiles, f, indent=2)
        return True
    except IOError as e:
        decky.logger.error(f"Failed to save profiles: {e}")
        return False


def _run_nmcli(args: list[str]) -> tuple[int, str, str]:
    """Run nmcli command and return (returncode, stdout, stderr)."""
    try:
        result = subprocess.run(
            ["nmcli", "-t"] + args,
            capture_output=True,
            text=True,
            timeout=15
        )
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return -1, "", "Command timed out"
    except FileNotFoundError:
        return -1, "", "nmcli not found"
    except Exception as e:
        return -1, "", str(e)


def _format_nmcli_error(action: str, rc: int, stdout: str, stderr: str) -> str:
    details = stderr or stdout or f"nmcli exited with code {rc}"
    return f"{action} failed: {details}"


def _nmcli_command(args: list[str]) -> str:
    return " ".join(["nmcli", "-t"] + [shlex.quote(arg) for arg in args])


def _nmcli_error_result(action: str, rc: int, stdout: str, stderr: str, args: list[str]) -> dict[str, Any]:
    details = stderr or stdout or f"nmcli exited with code {rc}"
    return {
        "success": False,
        "message": f"{action} failed",
        "error_action": action,
        "error_details": details,
        "error_command": _nmcli_command(args),
        "error_code": rc,
    }


def _modify_connection(conn_name: str, changes: list[str], action: str) -> dict[str, Any] | None:
    args = ["connection", "modify", conn_name] + changes
    rc, stdout, stderr = _run_nmcli(args)
    if rc != 0:
        return _nmcli_error_result(action, rc, stdout, stderr, args)
    return None


def _set_connection_dhcp(conn_name: str) -> dict[str, Any] | None:
    steps = [
        (["ipv4.method", "auto", "ipv4.ignore-auto-dns", "no"], "Set IPv4 method to DHCP"),
        (["ipv4.gateway", ""], "Clear IPv4 gateway"),
        (["ipv4.addresses", ""], "Clear IPv4 address"),
        (["ipv4.dns", ""], "Clear IPv4 DNS"),
    ]
    for changes, action in steps:
        error = _modify_connection(conn_name, changes, action)
        if error:
            return error
    return None


def _reactivate_connection(conn_name: str, success_message: str) -> dict[str, Any]:
    interface = _get_interface_for_connection(conn_name)
    if interface:
        rc, stdout, stderr = _run_nmcli(["device", "reapply", interface])
        if rc == 0:
            decky.logger.info(success_message)
            return {"success": True, "message": success_message}
        decky.logger.warning(_format_nmcli_error("Reapply device", rc, stdout, stderr))

    # Fall back to reconnecting the profile when device reapply is unavailable.
    rc, _, stderr = _run_nmcli(["connection", "down", conn_name])
    if rc != 0:
        decky.logger.warning(f"Connection down warning: {stderr}")

    args = ["connection", "up", conn_name]
    rc, stdout, stderr = _run_nmcli(args)
    if rc != 0:
        return _nmcli_error_result("Reactivate connection", rc, stdout, stderr, args)

    decky.logger.info(success_message)
    return {"success": True, "message": success_message}


def _get_active_connection() -> str | None:
    """Get the name of the currently active connection."""
    rc, stdout, stderr = _run_nmcli([
        "-f", "NAME,TYPE,DEVICE",
        "connection", "show", "--active"
    ])
    if rc == 0 and stdout:
        for line in stdout.split("\n"):
            parts = line.rsplit(":", 2)
            if len(parts) != 3:
                continue
            conn_name, conn_type, device = parts
            if conn_type in NETWORK_CONNECTION_TYPES and device and device != "--":
                return _unescape_nmcli_value(conn_name)
    elif stderr:
        decky.logger.warning(f"Failed to list active connections: {stderr}")

    rc, stdout, stderr = _run_nmcli([
        "-f", "DEVICE,TYPE,STATE,CONNECTION",
        "device", "status"
    ])
    if rc != 0 or not stdout:
        if stderr:
            decky.logger.warning(f"Failed to list network devices: {stderr}")
        return None

    for line in stdout.split("\n"):
        parts = line.rsplit(":", 3)
        if len(parts) != 4:
            continue
        _, device_type, state, conn_name = parts
        if (
            device_type in NETWORK_CONNECTION_TYPES
            and state == "connected"
            and conn_name
            and conn_name != "--"
        ):
            return _unescape_nmcli_value(conn_name)
    return None


def _get_interface_for_connection(conn_name: str) -> str | None:
    """Get the interface name for a connection."""
    rc, stdout, _ = _run_nmcli(["connection", "show", conn_name])
    if rc != 0:
        return None
    for line in stdout.split("\n"):
        if line.startswith("GENERAL.DEVICES:"):
            return line.split(":", 1)[1].strip()
    return None


class Plugin:
    async def _main(self):
        decky.logger.info("NetProfile Switcher started!")

    async def _unload(self):
        decky.logger.info("NetProfile Switcher unloading...")

    async def _uninstall(self):
        decky.logger.info("NetProfile Switcher uninstalled.")

    async def _migration(self):
        decky.migrate_settings(
            os.path.join(decky.DECKY_HOME, "settings", "netprofile_switcher.json"),
            os.path.join(decky.DECKY_USER_HOME, ".config", "netprofile_switcher")
        )
        decky.migrate_runtime(
            os.path.join(decky.DECKY_HOME, "netprofile_switcher"),
            os.path.join(decky.DECKY_USER_HOME, ".local", "share", "netprofile_switcher")
        )

    # ── Profile CRUD ──────────────────────────────────────────────

    async def get_profiles(self) -> list[dict[str, Any]]:
        """Return all saved network profiles."""
        return _load_profiles()

    async def save_profile(self, profile: dict[str, Any]) -> dict[str, Any]:
        """Save a new profile or update an existing one.
        profile must have: name, ip, subnet_mask, gateway, dns (list), method (manual|auto)
        Returns: {"success": bool, "message": str}
        """
        if not profile.get("name"):
            return {"success": False, "message": "Profile name is required"}

        profiles = _load_profiles()

        # Check for duplicate name
        existing = [p for p in profiles if p.get("name") == profile["name"]]
        if existing:
            # Update existing
            idx = profiles.index(existing[0])
            profiles[idx] = profile
        else:
            profiles.append(profile)

        if _save_profiles(profiles):
            decky.logger.info(f"Profile '{profile['name']}' saved successfully")
            return {"success": True, "message": f"Profile '{profile['name']}' saved"}
        return {"success": False, "message": "Failed to save profile"}

    async def delete_profile(self, name: str) -> dict[str, Any]:
        """Delete a profile by name.
        Returns: {"success": bool, "message": str}
        """
        profiles = _load_profiles()
        new_profiles = [p for p in profiles if p.get("name") != name]

        if len(new_profiles) == len(profiles):
            return {"success": False, "message": f"Profile '{name}' not found"}

        if _save_profiles(new_profiles):
            decky.logger.info(f"Profile '{name}' deleted")
            return {"success": True, "message": f"Profile '{name}' deleted"}
        return {"success": False, "message": "Failed to delete profile"}

    # ── Network Operations ────────────────────────────────────────

    async def get_current_network(self) -> dict[str, Any]:
        """Get the current active network configuration.
        Returns dict with connection info or error.
        """
        conn_name = _get_active_connection()
        if not conn_name:
            return {"error": "No active network connection found"}

        rc, stdout, stderr = _run_nmcli(["connection", "show", conn_name])
        if rc != 0:
            return {"error": f"Failed to get connection info: {stderr}"}

        info: dict[str, Any] = {
            "connection_name": conn_name,
            "ip": "",
            "subnet_mask": "",
            "gateway": "",
            "dns": [],
            "method": "auto",
        }

        for line in stdout.split("\n"):
            if ":" not in line:
                continue
            key, _, value = line.partition(":")

            if key == "ipv4.method":
                info["method"] = value
            elif key.startswith("IP4.ADDRESS[") and value:
                # Format: 192.168.1.100/24
                addr_parts = value.split("/")
                info["ip"] = addr_parts[0]
                if len(addr_parts) > 1:
                    info["subnet_mask"] = await self._cidr_to_mask(addr_parts[1])
            elif key.startswith("IP4.GATEWAY") and value:
                info["gateway"] = value
            elif key.startswith("IP4.DNS[") and value:
                info["dns"].append(value)

        return info

    async def apply_profile(self, name: str) -> dict[str, Any]:
        """Apply a saved network profile to the current connection.
        Returns: {"success": bool, "message": str}
        """
        profiles = _load_profiles()
        profile = next((p for p in profiles if p.get("name") == name), None)
        if not profile:
            return {"success": False, "message": f"Profile '{name}' not found"}

        conn_name = _get_active_connection()
        if not conn_name:
            return {"success": False, "message": "No active network connection found"}

        method = profile.get("method", "manual")

        if method == "auto":
            error = _set_connection_dhcp(conn_name)
            if error:
                return error
        else:
            # Manual configuration
            ip = str(profile.get("ip", "")).strip()
            subnet = str(profile.get("subnet_mask", "255.255.255.0")).strip()
            gateway = str(profile.get("gateway", "")).strip()
            dns_list = [
                str(dns).strip()
                for dns in profile.get("dns", [])
                if str(dns).strip()
            ]

            if not ip:
                return {"success": False, "message": "IP address is required for manual profile"}

            # Convert subnet mask to CIDR prefix
            cidr = await self._mask_to_cidr(subnet)
            if cidr is None:
                return {"success": False, "message": f"Invalid subnet mask: {subnet}"}

            steps = [
                (["ipv4.addresses", f"{ip}/{cidr}"], "Set IPv4 address"),
                (["ipv4.gateway", gateway], "Set IPv4 gateway"),
            ]

            if dns_list:
                steps.extend([
                    (["ipv4.dns", " ".join(dns_list)], "Set IPv4 DNS"),
                    (["ipv4.ignore-auto-dns", "yes"], "Ignore automatic DNS"),
                ])
            else:
                steps.extend([
                    (["ipv4.dns", ""], "Clear IPv4 DNS"),
                    (["ipv4.ignore-auto-dns", "no"], "Allow automatic DNS"),
                ])

            steps.append((["ipv4.method", "manual"], "Set IPv4 method to manual"))

            for changes, action in steps:
                error = _modify_connection(conn_name, changes, action)
                if error:
                    return error

        return _reactivate_connection(conn_name, f"Profile '{name}' applied successfully")

    async def set_dhcp(self) -> dict[str, Any]:
        """Switch the current active connection back to DHCP."""
        conn_name = _get_active_connection()
        if not conn_name:
            return {"success": False, "message": "No active network connection found"}

        error = _set_connection_dhcp(conn_name)
        if error:
            return error

        return _reactivate_connection(conn_name, "Switched current connection to DHCP")

    # ── Helpers ───────────────────────────────────────────────────

    async def _cidr_to_mask(self, cidr: str) -> str:
        """Convert CIDR prefix to subnet mask."""
        try:
            bits = int(cidr)
            if bits < 0 or bits > 32:
                return cidr
            mask = (0xFFFFFFFF << (32 - bits)) & 0xFFFFFFFF
            return f"{(mask >> 24) & 0xFF}.{(mask >> 16) & 0xFF}.{(mask >> 8) & 0xFF}.{mask & 0xFF}"
        except ValueError:
            return cidr

    async def _mask_to_cidr(self, mask: str) -> int | None:
        """Convert subnet mask to CIDR prefix."""
        try:
            parts = mask.split(".")
            if len(parts) != 4:
                return None
            binary = 0
            for part in parts:
                binary = (binary << 8) | int(part)
            if binary == 0:
                return 0
            # Count leading 1s
            cidr = 0
            bit = 1 << 31
            while bit and (binary & bit):
                cidr += 1
                bit >>= 1
            # Validate: after the 1s should be all 0s
            remaining = (1 << (32 - cidr)) - 1
            if (binary & remaining) != 0:
                return None
            return cidr
        except (ValueError, IndexError):
            return None

    async def validate_ip(self, ip: str) -> bool:
        """Validate an IPv4 address string."""
        pattern = r"^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$"
        m = re.match(pattern, ip)
        if not m:
            return False
        return all(0 <= int(g) <= 255 for g in m.groups())

    async def validate_subnet(self, mask: str) -> bool:
        """Validate a subnet mask string."""
        result = await self._mask_to_cidr(mask)
        return result is not None
