import { Accessor, createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import GLib from "gi://GLib?version=2.0";
import Gio from "gi://Gio?version=2.0";
import { CreateEntryContent, CreatePanel, playPanelSound } from "../helper";
import { interval } from "ags/time";

const HOME_DIR = GLib.get_home_dir();
export default function FilesystemInfo() {
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

    playPanelSound(1600)
    function changedataGridImage() {
        const currentPath = dataGridImage.get();
        (currentPath.includes("variant1") ? setdataGridImage(`${HOME_DIR}/.config/ags/assets/DataGrid-variant2.svg`) : 
            (currentPath.includes("variant3") ? setdataGridImage(`${HOME_DIR}/.config/ags/assets/DataGrid-variant1.svg`) : setdataGridImage(`${HOME_DIR}/.config/ags/assets/DataGrid-variant3.svg`))
        )
    }
    execAsync('ags request "getFilesystemInfoState"').then(out => settoggleContentState(out === 'true')).catch(console.error);

    function panelClicked() {
        execAsync('ags request "toggleFilesystemInfo"').then(out => {
            const isVisible = out === 'true';
            settoggleContentState(isVisible);
            if (isVisible) {
                playPanelSound(500);
            }
        }).catch(console.error);
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
            <CreatePanel name="FILESYSTEM" onClicked={panelClicked}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
            <With value={toggleContentState}>
                {(v) => ( 
                    <box visible={v} spacing={5} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.START} vexpand={false}>
                        <box cssClasses={["content"]} spacing={0} homogeneous={false} hexpand={false} vexpand={false}>
                            <box valign={Gtk.Align.FILL} spacing={0} orientation={Gtk.Orientation.VERTICAL} homogeneous={false} hexpand>
                                <box cssClasses={["entry"]} homogeneous={false} spacing={10} halign={Gtk.Align.FILL} vexpand>
                                    <CreateEntryContent name="FILESYSTEM NAME" value={filesystemName} />
                                    <CreateEntryContent name="TOTAL SIZE & FREE SPACE" value={totalSize} />
                                    <CreateEntryContent name="USED SPACE & PERCENTAGE" value={usedSpace} />
                                    <CreateEntryContent name="MOUNTPOINT" value={mountpoint} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} vexpand>
                                    <CreateEntryContent name="UUID & LABEL" value={uuidLabel} css='font-size: 8px;'/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL}>
                                    <CreateEntryContent name="FILESYSTEM OPTIONS" value={filesystemOptions} css='font-size: 8px;'/>
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
