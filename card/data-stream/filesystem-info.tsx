import { Accessor, createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import { CreateEntryContent, CreatePanel, HOME_DIR, updateRollingWindow, TOOLTIP_TEXT_CONTEXT_MENU, panelClicked, playSound, AudioFile, Align, ICON_DIR, createBindingCommandTableSetter } from "../../helper";
import { interval, Timer } from "ags/time";
import CreateGraph from "../../helper/create-graph";
import { cycleAssetVariant, initToggleState, openContextMenu, watchRequestBoolean } from "../../helper/behaviour";

export default function FilesystemInfo() {
    const [avgMemUsage, setAvgMemUsage] = createState([0]);
    const [readDiskOperation, setReadDiskOperation] = createState([0])
    const [writeDiskOperation, setWriteDiskOperation] = createState([0])

    const [filesystemName, setFilesystemName] = createState("");
    const [totalSize, setTotalSize] = createState("");
    const [usedSpace, setUsedSpace] = createState("");
    const [mountpoint, setMountpoint] = createState("");
    const [uuidLabel, setUuidLabel] = createState("");
    const [filesystemOptions, setFilesystemOptions] = createState("");

    const [mountpointList, setMountpointList] = createState("");
    const [blockList, setBlockList] = createState("");
    const [toggleContentState, setToggleContentState] = createState(false);
    const [dataGridImage, setDataGridImage] = createState(`${HOME_DIR}/.config/ags/assets/DataGrid-variant1.svg`);
    const [toggleGraphState, setToggleGraphState] = createState(false);

    let avgMemUsageInterval: Timer | null = null;
    let readDiskOperationInterval: Timer | null = null;
    let writeDiskOperationInterval: Timer | null = null;

    playSound(AudioFile.Panel, 1600)
    initToggleState("FilesystemInfo", setToggleContentState);
    watchRequestBoolean("FilesystemGraph", 800, (enabled) => {
            setToggleGraphState(enabled);
            if (enabled) {
                startIntervals();
            } else {
                stopIntervals();
            }
    });

    function startIntervals() {
        if (avgMemUsageInterval !== null) return; // Already running
        avgMemUsageInterval = interval(1000, () => execAsync(`awk '/^MemTotal:/ { total=$2 } /^MemAvailable:/ { avail=$2 } END { if (total > 0) printf "%.2f\\n", (total - avail) / total }' /proc/meminfo`).then((out) => {
            const usage = parseFloat(out);
            setAvgMemUsage((prev) => updateRollingWindow(prev, usage, 20));
        }))

        readDiskOperationInterval = interval(1000, () => execAsync(`python ${HOME_DIR}/.config/ags/scripts/read_ratio.py`).then((out) => {
            const usage = parseFloat(out);
            setReadDiskOperation((prev) => updateRollingWindow(prev, usage, 40));
        }))

        writeDiskOperationInterval = interval(1000, () => execAsync(`python ${HOME_DIR}/.config/ags/scripts/write_ratio.py`).then((out) => {
            const usage = parseFloat(out);
            setWriteDiskOperation((prev) => updateRollingWindow(prev, usage, 40));
        }))
    }

    function stopIntervals() {
        if (avgMemUsageInterval !== null) {
            avgMemUsageInterval.cancel();
            avgMemUsageInterval = null;
        }
        if (readDiskOperationInterval !== null) {
            readDiskOperationInterval.cancel();
            readDiskOperationInterval = null;
        }
        if (writeDiskOperationInterval !== null) {
            writeDiskOperationInterval.cancel();
            writeDiskOperationInterval = null;
        }
    }

    function onRightClicked() {
        openContextMenu("filesystem-info.tsx");
    }

    interval(1000, () => {
        setDataGridImage((currentPath) => cycleAssetVariant(currentPath, [
            `${HOME_DIR}/.config/ags/assets/DataGrid-variant1.svg`,
            `${HOME_DIR}/.config/ags/assets/DataGrid-variant2.svg`,
            `${HOME_DIR}/.config/ags/assets/DataGrid-variant3.svg`,
        ]));
    });
    createBindingCommandTableSetter({
            [`lsblk -f | grep root | tr -s ' ' | cut -d ' ' -f 2`]: setFilesystemName,
            [`df -H / | tr -s ' ' | cut -d ' ' -f 2,4 | sed 1d`]: setTotalSize,
            [`df -H / | tr -s ' ' | cut -d ' ' -f 3,5 | sed 1d`]: setUsedSpace,
            [`df -H -a -t $(lsblk -f | grep root | tr -s ' ' | cut -d ' ' -f 2) | tr -s ' ' | cut -d ' ' -f 6 | paste -d ' ' -s | sed 's/Mounted //'`]: setMountpoint,
            [`lsblk -l -no UUID,LABEL,NAME | sed '/^[[:space:]]*$/d' | tr -s ' ' | sed '/^ /d' | column | head -n2`]: setUuidLabel,
            [`findmnt -n -o OPTIONS,TARGET -l -t btrfs | tr -s ' '`]: setFilesystemOptions,
        }, {
            transform: (value) => value.toUpperCase().trim(),
            onError: (_, error) => console.log(error),
        },);

    createBindingCommandTableSetter({
        [`findmnt -l -t btrfs,vfat,proc,efivarfs,tmpfs | head -n 13`]: setMountpointList,
        [`lsblk -a --list`]: setBlockList,
    });
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="FILESYSTEM" onClicked={() => panelClicked("FilesystemInfo", setToggleContentState)} onRightClick={onRightClicked} tooltipText={TOOLTIP_TEXT_CONTEXT_MENU} childrenRight={
                <image file={`${ICON_DIR}/ph--mouse-right-click-fill.svg`} pixelSize={16} />
            }>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
            <With value={toggleContentState}>
                {(v) => ( 
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL} valign={Align.LEFT} vexpand={false}>
                        <box>
                            <With value={toggleGraphState}>
                                {(v) => (
                                    <box visible={v} marginStart={7} marginEnd={7} marginTop={10} >
                                        <CreateGraph title={"MEMORY USAGE"} valueToWatch={avgMemUsage} threshold={0.7} height={13} lineWidth={0.8}/>
                                        <CreateGraph title={"READ OPERATION"} valueToWatch={readDiskOperation} height={13} lineWidth={0.8} />
                                        <CreateGraph title={"WRITE OPERATION"} valueToWatch={writeDiskOperation} height={13} lineWidth={0.8} />
                                    </box>
                                )}
                            </With>
                        </box>
                        <box cssClasses={["content"]} spacing={0} homogeneous={false} hexpand={false} vexpand={false}>
                            <box valign={Align.FILL} spacing={0} orientation={Gtk.Orientation.VERTICAL} homogeneous={false} hexpand>
                                <box cssClasses={["entry"]} homogeneous={false} spacing={10} halign={Align.FILL} vexpand>
                                    <CreateEntryContent name="FILESYSTEM NAME" value={filesystemName} />
                                    <CreateEntryContent name="TOTAL SIZE & FREE SPACE" value={totalSize} allowCopy/>
                                    <CreateEntryContent name="USED SPACE & PERCENTAGE" value={usedSpace} allowCopy/>
                                    <CreateEntryContent name="MOUNTPOINT" value={mountpoint} allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} vexpand>
                                    <CreateEntryContent name="UUID & LABEL" value={uuidLabel} css='font-size: 8px;' important allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL}>
                                    <CreateEntryContent name="FILESYSTEM OPTIONS" value={filesystemOptions} css='font-size: 8px;' important allowCopy/>
                                </box>
                            </box>
                            <box>
                                <With value={dataGridImage}> 
                                    {(path) => ( <Gtk.Picture canShrink={false} file={Gio.File.new_for_path(path)}/> )} 
                                </With>
                            </box>
                        </box>
                        <box cssClasses={["extended-content"]} hexpand={false} halign={Align.FILL}>
                            <scrolledwindow minContentWidth={100} minContentHeight={55} hexpand={true}>
                                <box valign={Align.TOP} homogeneous={false} spacing={20}>
                                    <label label={mountpointList} valign={Align.TOP} halign={Align.LEFT} />
                                    <label label={blockList} valign={Align.TOP} halign={Align.LEFT} />
                                </box>
                            </scrolledwindow>
                        </box>
                    </box>
                )}
            </With>
        </box>
    )
}
