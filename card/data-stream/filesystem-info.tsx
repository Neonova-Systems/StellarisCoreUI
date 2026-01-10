import { Accessor, createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import { CreateEntryContent, CreatePanel, playPanelSound, HOME_DIR, updateRollingWindow, TOOLTIP_TEXT_CONTEXT_MENU, playGrantedSound, panelClicked } from "../../helper";
import { interval, timeout, Timer } from "ags/time";
import CreateGraph from "../../helper/create-graph";

export default function FilesystemInfo() {
    const [avgMemUsage, setAvgMemUsage] = createState([0]);
    const [readDiskOperation, setReadDiskOperation] = createState([0])
    const [writeDiskOperation, setWriteDiskOperation] = createState([0])

    const [filesystemName, setfilesystemName] = createState("");
    const [totalSize, settotalSize] = createState("");
    const [usedSpace, setusedSpace] = createState("");
    const [mountpoint, setmountpoint] = createState("");
    const [uuidLabel, setuuidLabel] = createState("");
    const [filesystemOptions, setfilesystemOptions] = createState("");

    const [mountpointList, setmountpointList] = createState("");
    const [blockList, setblockList] = createState("");
    const [toggleContentState, settoggleContentState] = createState(false);
    const [dataGridImage, setdataGridImage] = createState(`${HOME_DIR}/.config/ags/assets/DataGrid-variant1.svg`);
    const [toggleGraphState, settoggleGraphState] = createState(false);

    let avgMemUsageInterval: Timer | null = null;
    let readDiskOperationInterval: Timer | null = null;
    let writeDiskOperationInterval: Timer | null = null;

    playPanelSound(1600)
    timeout(500, () => { execAsync('ags request "getFilesystemInfoState"').then(out => settoggleContentState(out === 'true')) });
    interval(800, () => { execAsync('ags request "getFilesystemGraphState"').then(out => {
            const enabled = out === 'true';
            settoggleGraphState(enabled);
            if (enabled) {
                startIntervals();
            } else {
                stopIntervals();
            }
        });
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

    function changedataGridImage() {
        const currentPath = dataGridImage.get();
        (currentPath.includes("variant1") ? setdataGridImage(`${HOME_DIR}/.config/ags/assets/DataGrid-variant2.svg`) : 
            (currentPath.includes("variant3") ? setdataGridImage(`${HOME_DIR}/.config/ags/assets/DataGrid-variant1.svg`) : setdataGridImage(`${HOME_DIR}/.config/ags/assets/DataGrid-variant3.svg`))
        )
    }

    function onRightClicked() {
        execAsync(`ags run ${HOME_DIR}/.config/ags/window/context-menu/filesystem-info.tsx --gtk 4`).catch((e) => print(e))
        playGrantedSound();
    }

    interval(1000, () => { changedataGridImage() })
    execAsync(`dash -c "lsblk -f | grep root | tr -s ' ' | cut -d ' ' -f 2"`).then((out) => setfilesystemName(out.toUpperCase()))
    execAsync(`dash -c "df -H / | tr -s ' ' | cut -d ' ' -f 2,4 | sed 1d"`).then((out) => settotalSize(out.toUpperCase()))
    execAsync(`dash -c "df -H / | tr -s ' ' | cut -d ' ' -f 3,5 | sed 1d"`).then((out) => setusedSpace(out));
    execAsync(`dash -c "df -H -a -t $(lsblk -f | grep root | tr -s ' ' | cut -d ' ' -f 2) | tr -s ' ' | cut -d ' ' -f 6 | paste -d ' ' -s | sed 's/Mounted //'"`).then((out) => setmountpoint(out));

    execAsync(`dash -c " lsblk -l -no UUID,LABEL,NAME | sed '/^[[:space:]]*$/d' | tr -s ' ' | sed '/^ /d' | column | head -n2"`).then((out) => setuuidLabel(out.toUpperCase()));
    execAsync(`dash -c "findmnt -n -o OPTIONS,TARGET -l -t btrfs | tr -s ' '"`).then((out) => setfilesystemOptions(out.toUpperCase())).catch((out) => console.log(out))

    execAsync(`dash -c "findmnt -l -t btrfs,vfat,proc,efivarfs,tmpfs | head -n 13"`).then((out) => setmountpointList(out));
    execAsync(`dash -c "lsblk -a --list"`).then((out) => setblockList(out));
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="FILESYSTEM" onClicked={() => panelClicked("FilesystemInfo", settoggleContentState)} onRightClick={onRightClicked} tooltipText={TOOLTIP_TEXT_CONTEXT_MENU}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
            <With value={toggleContentState}>
                {(v) => ( 
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.START} vexpand={false}>
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
                            <box valign={Gtk.Align.FILL} spacing={0} orientation={Gtk.Orientation.VERTICAL} homogeneous={false} hexpand>
                                <box cssClasses={["entry"]} homogeneous={false} spacing={10} halign={Gtk.Align.FILL} vexpand>
                                    <CreateEntryContent name="FILESYSTEM NAME" value={filesystemName} />
                                    <CreateEntryContent name="TOTAL SIZE & FREE SPACE" value={totalSize} allowCopy/>
                                    <CreateEntryContent name="USED SPACE & PERCENTAGE" value={usedSpace} allowCopy/>
                                    <CreateEntryContent name="MOUNTPOINT" value={mountpoint} allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} vexpand>
                                    <CreateEntryContent name="UUID & LABEL" value={uuidLabel} css='font-size: 8px;' allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL}>
                                    <CreateEntryContent name="FILESYSTEM OPTIONS" value={filesystemOptions} css='font-size: 8px;' allowCopy/>
                                </box>
                            </box>
                            <box>
                                <With value={dataGridImage}> 
                                    {(path) => ( <Gtk.Picture canShrink={false} file={Gio.File.new_for_path(path)}/> )} 
                                </With>
                            </box>
                        </box>
                        <box cssClasses={["extended-content"]} hexpand={false} halign={Gtk.Align.FILL}>
                            <scrolledwindow minContentWidth={100} minContentHeight={55} hexpand={true}>
                                <box valign={Gtk.Align.START} homogeneous={false} spacing={20}>
                                    <label label={mountpointList} valign={Gtk.Align.START} halign={Gtk.Align.START} />
                                    <label label={blockList} valign={Gtk.Align.START} halign={Gtk.Align.START} />
                                </box>
                            </scrolledwindow>
                        </box>
                    </box>
                )}
            </With>
        </box>
    )
}
