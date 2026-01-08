import { Accessor, createState, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import { CreateEntryContent, CreatePanel, playPanelSound, HOME_DIR, ICON_DIR } from "../../helper";
import { interval, timeout } from "ags/time";
import Gio from 'gi://Gio?version=2.0';
import CreateUtilityButton from '../../helper/create-utility-button';

export default function SystemInfo() {
    const [userHostname, setuserHostname] = createState("");
    const [dependecyInstalled, setdependecyInstalled] = createState("");
    const [availableUpgrade, setavailableUpgrade] = createState("");
    const [kernelInformation, setkernelInformation] = createState("");
    const [unneededPackage, setunneedPackage] = createState("");
    const [totalBootTime, settotalBootTime] = createState("");
    const [userId, setuserId] = createState("");
    const [uptime, setuptime] = createState("");
    const [bootTimeLoader, setbootTimeLoader] = createState("");
    const [packageInstalled, setpackageInstalled] = createState("");
    const [explicitInstalled, setexplicitInstalled] = createState("");
    const [bootTimeUserspace, setbootTimeUserspace] = createState("");
    const [journalHead, setjournalHead] = createState("");
    const [systemdBlame, setsystemdBlame] = createState("");
    const [toggleContentState, settoggleContentState] = createState(false);

    playPanelSound(1400)
    timeout(500, () => { execAsync('ags request "getSystemInfoState"').then(out => settoggleContentState(out === 'true')) });

    function panelClicked() {
        execAsync('ags request "toggleSystemInfo"').then(out => {
            const isVisible = out === 'true';
            settoggleContentState(isVisible);
            if (isVisible) {
                playPanelSound(500);
            }
        });
    }

    function changeProfilePicture() {
        const dialog = new Gtk.FileDialog();
        
        // Create file filter for images
        const imageFilter = new Gtk.FileFilter();
        imageFilter.set_name("Image Files");
        imageFilter.add_mime_type("image/png");
        imageFilter.add_mime_type("image/jpeg");
        imageFilter.add_mime_type("image/jpg");
        imageFilter.add_mime_type("image/gif");
        imageFilter.add_mime_type("image/webp");
        imageFilter.add_mime_type("image/bmp");
        imageFilter.add_mime_type("image/svg+xml");
        
        // Create list store for filters
        const filterStore = Gio.ListStore.new(Gtk.FileFilter.$gtype);
        filterStore.append(imageFilter);
        
        dialog.set_filters(filterStore);
        dialog.set_default_filter(imageFilter);
        
        dialog.open(null, null, (source, result) => {
            try {
                const file = dialog.open_finish(result);
                if (file) {
                    const sourcePath = file.get_path();
                    const targetPath = `${HOME_DIR}/.face.icon`;
                    
                    // Copy the selected file to ~/.face.icon
                    execAsync(`cp "${sourcePath}" "${targetPath}"`).then(() => {
                        console.log("Profile picture updated successfully");
                    }).catch(err => {
                        console.error("Failed to update profile picture:", err);
                    });
                }
            } catch (err) {
                console.log("File selection cancelled or failed");
            }
        });
    }

    execAsync('bash -c "{ whoami; hostname; } | paste -d "@" -s"').then((out) => setuserHostname(out.toUpperCase()))
    execAsync('dash -c "pacman -Qdq | wc -l"').then((out) => setdependecyInstalled(out));
    execAsync('dash -c "pacman -Quq | wc -l"').then((out) => setavailableUpgrade(out));

    execAsync('dash -c "uname -sr"').then((out) => setkernelInformation(out.toUpperCase()));
    execAsync('dash -c "pacman -Qdt | wc -l"').then((out) => setunneedPackage(out));
    execAsync(`dash -c "systemd-analyze | cut -d'=' -f2 | head -n1 | tr -d ' '"`).then((out) => settotalBootTime(out));

    execAsync('dash -c "id -u $(whoami)"').then((out) => setuserId(out));
    execAsync(`dash -c "systemd-analyze | cut -d'+' -f2 | head -n1 | cut -d' ' -f2"`).then((out) => setbootTimeLoader(out));

    execAsync('dash -c "pacman -Qq | wc -l"').then((out) => setpackageInstalled(out));
    execAsync(`dash -c "pacman -Qeq | wc -l"`).then((out) => setexplicitInstalled(out));
    execAsync(`dash -c "systemd-analyze | cut -d'+' -f4 | head -n1 | cut -d' ' -f2"`).then((out) => setbootTimeUserspace(out));

    execAsync(`dash -c "journalctl -b -o cat | head -n60"`).then((out) => setjournalHead(out));
    execAsync(`dash -c "systemd-analyze blame"`).then((out) => setsystemdBlame(out));
    interval(60000, () => execAsync(`dash -c "uptime -p | cut -d ' ' -f 2-"`).then((out) => setuptime(out.toUpperCase())))
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="SYSTEM" onClicked={panelClicked}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
            <With value={toggleContentState}>
                {(v) => ( 
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} spacing={5} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <button onClicked={changeProfilePicture} tooltipText={"Click to change your profile picture"} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
                                <image file={`${HOME_DIR}/.face.icon`} pixelSize={33} valign={Gtk.Align.START} cssClasses={["profile-picture"]}></image>
                            </button>
                            <box homogeneous={false} halign={Gtk.Align.FILL} hexpand={true}>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand>
                                    <CreateEntryContent name="USER & HOSTNAME" value={userHostname} allowCopy={true} />
                                    <CreateEntryContent name="DEPENDENCY PACKAGE:" value={dependecyInstalled} />
                                    <CreateEntryContent name="AVAILABLE UPGRADE" value={availableUpgrade}>
                                        <CreateUtilityButton imageFile={`${ICON_DIR}/majesticons--open.svg`} tooltipText={"Check for system updates"} pixelSize={8} />
                                    </CreateEntryContent>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand>
                                    <CreateEntryContent name="KERNEL INFORMATION" value={kernelInformation} allowCopy={true} />
                                    <CreateEntryContent name="UNNEEDED PACKAGE" value={unneededPackage} />
                                    <CreateEntryContent name="TOTAL BOOT TIME" value={totalBootTime} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand>
                                    <CreateEntryContent name="CURRENT USER ID" value={userId} allowCopy/>
                                    <CreateEntryContent name="UPTIME" value={uptime} allowCopy/>
                                    <CreateEntryContent name="BOOT TIME LOADER" value={bootTimeLoader} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL}>
                                    <CreateEntryContent name="PACKAGE INSTALLED" value={packageInstalled} />
                                    <CreateEntryContent name="EXPLICITLY INSTALLED" value={explicitInstalled} />
                                    <CreateEntryContent name="BOOT TIME USERSPACE" value={bootTimeUserspace} />
                                </box>
                            </box>
                        </box>
                        <box cssClasses={["extended-content"]} hexpand={false} halign={Gtk.Align.FILL}>
                            <scrolledwindow minContentWidth={100} minContentHeight={90} hexpand={true}>
                                <box valign={Gtk.Align.START} homogeneous={false} spacing={20}>
                                    <label label={journalHead} valign={Gtk.Align.START} halign={Gtk.Align.START} />
                                    <label label={systemdBlame} valign={Gtk.Align.START} halign={Gtk.Align.START} />
                                </box>
                            </scrolledwindow>
                        </box>
                    </box>
                )}
            </With>
        </box>
    )
}
