import { spawnContextMenu } from "../ContextMenu"

const FOOT_SHC_PREFIX = "foot -e sh -c ";

function buildSmartCommand(device: string) {
    return `${FOOT_SHC_PREFIX}'if [ ! -e ${device} ]; then echo "Device not found: ${device}"; echo; echo "Press Enter to close..."; read _; exit 1; fi; sudo smartctl -a ${device}; echo; echo "Press Enter to close..."; read _'`;
}

const commandsList = [
    { name: "Toggle", description: "Toggle filesystem monitoring graphs visibility", command: "ags request 'toggle FilesystemGraph'", keybind: ""},
    { name: "SMART report /dev/nvme0", description: "Run full smartctl report for NVMe controller\n/dev/nvme0", command: buildSmartCommand("/dev/nvme0"), keybind: "", dontAsync: true},
    { name: "SMART report /dev/nvme1", description: "Run full smartctl report for NVMe controller\n/dev/nvme1", command: buildSmartCommand("/dev/nvme1"), keybind: "", dontAsync: true},
    { name: "SMART report /dev/sda", description: "Run full smartctl report for SATA/SAS disk /dev/sda", command: buildSmartCommand("/dev/sda"), keybind: "", dontAsync: true},
    { name: "SMART report /dev/sdb", description: "Run full smartctl report for SATA/SAS disk /dev/sdb", command: buildSmartCommand("/dev/sdb"), keybind: "", dontAsync: true},
]
spawnContextMenu(commandsList);