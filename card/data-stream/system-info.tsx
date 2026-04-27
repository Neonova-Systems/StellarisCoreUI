import { Accessor, createState, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import { CreateEntryContent, CreatePanel, HOME_DIR, ICON_DIR, panelClicked, AudioFile, playSound, Align, createBindingCommandTableSetter } from "../../helper";
import { interval } from "ags/time";
import Gio from 'gi://Gio?version=2.0';
import CreateUtilityButton from '../../helper/create-utility-button';
import Adw from "gi://Adw?version=1";
import { initToggleState } from "../../helper/behaviour";
import CreateCard from "../../helper/create-card";

export default function SystemInfo() {
    const [userHostname, setUserHostname] = createState("");
    const [dependecyInstalled, setDependecyInstalled] = createState("");
    const [availableUpgrade, setAvailableUpgrade] = createState("");
    const [kernelInformation, setKernelInformation] = createState("");
    const [unneededPackage, setUnneedPackage] = createState("");
    const [totalBootTime, setTotalBootTime] = createState("");
    const [userId, setUserId] = createState("");
    const [uptime, setUptime] = createState("");
    const [bootTimeLoader, setBootTimeLoader] = createState("");
    const [packageInstalled, setPackageInstalled] = createState("");
    const [explicitInstalled, setExplicitInstalled] = createState("");
    const [bootTimeUserspace, setBootTimeUserspace] = createState("");
    const [journalHead, setJournalHead] = createState("");
    const [systemdBlame, setSystemdBlame] = createState("");
    const [toggleContentState, setToggleContentState] = createState(false);

    playSound(AudioFile.Panel, 1400);
    initToggleState("SystemInfo", setToggleContentState);

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

    function checkSystemUpdates() {
        execAsync(`dash ${HOME_DIR}/.config/ags/scripts/system-update.sh`).then(() => {
            execAsync('dash -c "pacman -Quq | wc -l"').then((out) => setAvailableUpgrade(out)); // Refresh the available upgrade count after the script completes
        }).catch(err => {
            console.error("Failed to check for system updates:", err);
        });
    }

    createBindingCommandTableSetter({
            [`{ whoami; hostname; } | paste -d '@' -s`]: setUserHostname,
            [`pacman -Qdq | wc -l`]: setDependecyInstalled,
            [`pacman -Quq | wc -l`]: setAvailableUpgrade,
            [`uname -sr`]: setKernelInformation,
            [`pacman -Qdt | wc -l`]: setUnneedPackage,
            [`systemd-analyze | cut -d'=' -f2 | head -n1 | tr -d ' '`]: setTotalBootTime,
            [`id -u $(whoami)`]: setUserId,
            [`systemd-analyze | cut -d'+' -f2 | head -n1 | cut -d' ' -f2`]: setBootTimeLoader,
            [`pacman -Qq | wc -l`]: setPackageInstalled,
            [`pacman -Qeq | wc -l`]: setExplicitInstalled,
            [`systemd-analyze | cut -d'+' -f4 | head -n1 | cut -d' ' -f2`]: setBootTimeUserspace,
        }, {
            transform: (value, command) => command.includes("whoami") ? value.toUpperCase().trim() : value.trim(),
        });

    createBindingCommandTableSetter({
        [`journalctl -b -o cat | head -n60`]: setJournalHead,
        [`systemd-analyze blame`]: setSystemdBlame,
    });
    interval(60000, () => execAsync(`dash -c "uptime -p | cut -d ' ' -f 2-"`).then((out) => setUptime(out.toUpperCase())))

    function renderContent() {
        return (
        <box  cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
            <box cssClasses={["content"]} spacing={5} halign={Align.FILL} valign={Align.LEFT} homogeneous={false} hexpand={false}>
                <box orientation={Gtk.Orientation.VERTICAL} homogeneous={false}>
                    <button onClicked={changeProfilePicture} tooltipText={"Click to change your profile picture"} cursor={Gdk.Cursor.new_from_name("pointer", null)} vexpand>
                        <image file={`${HOME_DIR}/.face.icon`} pixelSize={33} valign={Align.LEFT} cssClasses={["profile-picture"]}></image>
                    </button>
                    <Adw.Clamp maximumSize={33} vexpand>
                        <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/ornament2.svg`)} canShrink={true} contentFit={Gtk.ContentFit.CONTAIN} />
                    </Adw.Clamp>
                </box>
                <box homogeneous={false} halign={Align.FILL} hexpand={true}>
                    <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand>
                        <CreateEntryContent name="USER & HOSTNAME" value={userHostname} important allowCopy={true} />
                        <CreateEntryContent name="DEPENDENCY PACKAGE:" value={dependecyInstalled} />
                        <CreateEntryContent name="AVAILABLE UPGRADE" value={availableUpgrade}>
                            <CreateUtilityButton imageFile={`${ICON_DIR}/tabler--refresh.svg`} tooltipText={"Check for system updates"} pixelSize={8} onClicked={checkSystemUpdates} />
                        </CreateEntryContent>
                    </box>
                    <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand>
                        <CreateEntryContent name="KERNEL INFORMATION" value={kernelInformation} important allowCopy={true} />
                        <CreateEntryContent name="UNNEEDED PACKAGE" value={unneededPackage} />
                        <CreateEntryContent name="TOTAL BOOT TIME" important value={totalBootTime} />
                    </box>
                    <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand>
                        <CreateEntryContent name="CURRENT USER ID" value={userId} allowCopy/>
                        <CreateEntryContent name="UPTIME" value={uptime} allowCopy/>
                        <CreateEntryContent name="BOOT TIME LOADER" value={bootTimeLoader} />
                    </box>
                    <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL}>
                        <CreateEntryContent name="PACKAGE INSTALLED" value={packageInstalled} />
                        <CreateEntryContent name="EXPLICITLY INSTALLED" value={explicitInstalled} />
                        <CreateEntryContent name="BOOT TIME USERSPACE" value={bootTimeUserspace} />
                    </box>
                </box>
            </box>
            <box cssClasses={["extended-content"]} hexpand={false} halign={Align.FILL}>
                <scrolledwindow minContentWidth={100} minContentHeight={90} hexpand={true} hscrollbarPolicy={Gtk.PolicyType.ALWAYS} vscrollbarPolicy={Gtk.PolicyType.EXTERNAL} cssClasses={["scrollbar"]} >
                    <box valign={Align.LEFT} homogeneous={false} spacing={20}>
                        <Gtk.GestureClick />
                        <label label={journalHead} valign={Align.LEFT} halign={Align.LEFT} />
                        <label label={systemdBlame} valign={Align.LEFT} halign={Align.LEFT} />
                    </box>
                </scrolledwindow>
            </box>
        </box>
        )
    }

    return (
        <CreateCard state={toggleContentState} cardContent={() => renderContent()}>
            <CreatePanel isActive={toggleContentState} name="SYSTEM" onClicked={() => panelClicked("SystemInfo", setToggleContentState)}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
        </CreateCard>
    )
}
