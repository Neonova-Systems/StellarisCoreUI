import { Accessor, createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import { interval, timeout } from "ags/time";
import Gio from "gi://Gio?version=2.0";
import { CreateEntryContent, CreatePanel, playPanelSound, HOME_DIR } from "../../helper";

export default function NetworkInfo() {
    const [currentSSID, setcurrentSSID] = createState("");
    const [interfaceMode, setinterfaceMode] = createState("");
    const [frequency, setfrequency] = createState("");
    const [dnsServers, setdnsServers] = createState("");
    const [currentMAC, setcurrentMAC] = createState("");
    const [altInterfaceName, setaltInterfaceName] = createState("");
    const [currentSubnet, setcurrentSubnet] = createState("");
    const [openPorts, setopenPorts] = createState("");
    const [localIp, setlocalIp] = createState("");
    const [currentBitrate, setcurrentBitrate] = createState("");
    const [transmitByte, settransmitByte] = createState("");
    const [tcpConnection, settcpConnection] = createState("");

    const [gatewayIp, setgatewayIp] = createState("");
    const [linkQuality, setlinkQuality] = createState("");
    const [receiveByte, setreceiveByte] = createState("");
    const [udpConnection, setudpConnection] = createState("");
    const [journalNetwork, setJournalNetwork] = createState("");
    const [networkDevice, setNetworkDevice] = createState("");
    const [wifiList, setwifiList] = createState("");
    const [toggleContentState, settoggleContentState] = createState(false);
    const [noiseGridImage, setnoiseGridImage] = createState(`${HOME_DIR}/.config/ags/assets/NoiseGrid-variant1.svg`);

    playPanelSound(1500)
    timeout(500, () => { execAsync('ags request "getNetworkInfoState"').then(out => settoggleContentState(out === 'true')) });

    function changeNoiseGridImage() {
        const currentPath = noiseGridImage.get();
        (currentPath.includes("variant1") ? setnoiseGridImage(`${HOME_DIR}/.config/ags/assets/NoiseGrid-variant2.svg`) : setnoiseGridImage(`${HOME_DIR}/.config/ags/assets/NoiseGrid-variant1.svg`))
    }
    function panelClicked() {
        execAsync('ags request "toggleNetworkInfo"').then(out => {
            const isVisible = out === 'true';
            settoggleContentState(isVisible);
            if (isVisible) {
                playPanelSound(500);
            }
        }).catch(() => {});
    }

    interval(500, () => { changeNoiseGridImage() })
    execAsync(`bash -c "iwconfig wlan0 | grep ESSID | cut -d '\\"' -f 2"`).then((out) => setcurrentSSID(out.toUpperCase()))
    execAsync(`dash -c "iwconfig wlan0 | grep Mode | tr -s ' ' | cut -d ' ' -f 2"`).then((out) => setinterfaceMode(out.toUpperCase()))
    execAsync(`dash -c "iwconfig wlan0 | grep Frequency | tr -s ' ' | cut -d ' ' -f 3-4 | cut -d ':' -f2"`).then((out) => setfrequency(out));
    execAsync(`dash -c "nmcli device show | grep IP4.DNS | tr -s ' ' | cut -d ' ' -f 2 | paste -d ' ' -s"`).then((out) => setdnsServers(out));

    execAsync(`dash -c "iwconfig wlan0 | grep Access | tr -s ' ' | cut -d ' ' -f 7"`).then((out) => setcurrentMAC(out.toUpperCase()));
    execAsync(`dash -c "ip a | grep --after-context 4 wlan0 | grep altname | tr -s ' ' | cut -d ' ' -f 3 | head -n2 | paste -d \\",\\" - -"`).then((out) => setaltInterfaceName(out.toUpperCase()));
    execAsync(`dash -c "ifconfig wlan0 | grep netmask | tr -s ' ' | cut -d ' ' -f 5"`).then((out) => setcurrentSubnet(out.toUpperCase()));
    execAsync(`dash -c "lsof -i -P -n | grep LISTEN | wc -l"`).then((out) => setopenPorts(out.toUpperCase()));

    execAsync(`dash -c "ip address | grep --after-context 1 'enp\\|eth\\|wl\\|wlan' | grep inet | cut -d ' ' -f 6,13 | head -n 1"`).then((out) => setlocalIp(out.toUpperCase())).catch((out) => console.log(out))
    execAsync(`dash -c "iwconfig wlan0 | grep Bit | tr -s ' ' | cut -d ' ' -f 2-4 | cut -d '=' -f 2"`).then((out) => setcurrentBitrate(out.toUpperCase()));
    execAsync(`dash -c "ifconfig wlan0 | grep TX | head -n1 | tr -s ' ' | cut -d ' ' -f 7-"`).then((out) => settransmitByte(out.toUpperCase()));
    execAsync(`dash -c "lsof -i -P | grep TCP | wc -l"`).then((out) => settcpConnection(out.toUpperCase()));


    execAsync(`dash -c "ip route show | grep default | cut -d ' ' -f3,5 | head -n 1"`).then((out) => setgatewayIp(out.toUpperCase()));
    execAsync(`dash -c "iwconfig wlan0 | grep Link | tr -s ' ' | cut -d ' ' -f 2-3 | cut -d '=' -f 2"`).then((out) => setlinkQuality(out.toUpperCase()));
    execAsync(`dash -c "ifconfig wlan0 | grep RX | head -n1 | tr -s ' ' | cut -d ' ' -f 7-"`).then((out) => setreceiveByte(out.toUpperCase()));
    execAsync(`dash -c "lsof -i -P | grep UDP | wc -l"`).then((out) => setudpConnection(out.toUpperCase()));

    execAsync(`dash -c "journalctl -b --grep=network | tail -n 13"`).then((out) => setJournalNetwork(out));
    execAsync(`dash -c "nmcli dev"`).then((out) => setNetworkDevice(out));
    execAsync(`dash -c "nmcli dev wifi list | head -n 10"`).then((out) => setwifiList(out));
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="NETWORK" onClicked={panelClicked}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
            <With value={toggleContentState}>
                {(v) => ( 
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <box homogeneous={false} halign={Gtk.Align.FILL} hexpand={true}>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CURRENT SSID" value={currentSSID} allowCopy/>
                                    <CreateEntryContent name="INTERFACE MODE" value={interfaceMode} allowCopy/>
                                    <CreateEntryContent name="FREQUENCY" value={frequency} allowCopy/>
                                    <CreateEntryContent name="DNS SERVERS" value={dnsServers} allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CURRENT MAC" value={currentMAC} allowCopy/>
                                    <CreateEntryContent name="ALT INTERFACE NAME" value={altInterfaceName} />
                                    <CreateEntryContent name="CURRENT SUBNET" value={currentSubnet} />
                                    <CreateEntryContent name="OPEN PORTS" value={openPorts} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="LOCAL IP" value={localIp} allowCopy/>
                                    <CreateEntryContent name="CURRENT BITRATE" value={currentBitrate} />
                                    <CreateEntryContent name="TRANSMIT BYTE" value={transmitByte} />
                                    <CreateEntryContent name="TCP CONNECTION" value={tcpConnection} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL}>
                                    <CreateEntryContent name="GATEWAY IP" value={gatewayIp} allowCopy/>
                                    <CreateEntryContent name="LINK QUALITY" value={linkQuality} />
                                    <CreateEntryContent name="RECEIVE BYTE" value={receiveByte} />
                                    <CreateEntryContent name="UDP CONNECTION" value={udpConnection} />
                                </box>
                            </box>
                        </box>
                        <box cssClasses={["NoiseGrid"]}>
                            <With value={noiseGridImage}> 
                                {(path) => ( <Gtk.Picture file={Gio.File.new_for_path(path)} halign={Gtk.Align.FILL} /> )} 
                            </With>
                        </box>
                        <box cssClasses={["extended-content"]} css={"font-size: 4px;"} hexpand={false} halign={Gtk.Align.FILL}>
                            <scrolledwindow minContentWidth={100} minContentHeight={55} hexpand={true}>
                                <box valign={Gtk.Align.START} homogeneous={false} spacing={20}>
                                    <label label={journalNetwork} valign={Gtk.Align.START} halign={Gtk.Align.START} />
                                    <label label={networkDevice} valign={Gtk.Align.START} halign={Gtk.Align.START} />
                                    <label label={wifiList} valign={Gtk.Align.START} halign={Gtk.Align.START} />
                                </box>
                            </scrolledwindow>
                        </box>
                    </box>
                )}
            </With>
        </box>
    )
}
