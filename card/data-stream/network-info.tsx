import { Accessor, createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import { interval, timeout } from "ags/time";
import Gio from "gi://Gio?version=2.0";
import { CreateEntryContent, CreatePanel, HOME_DIR, panelClicked, playSound, AudioFile, Align, createBindingCommandTableSetter } from "../../helper";

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

    playSound(AudioFile.Panel, 1500);
    timeout(500, () => { execAsync('ags request "getNetworkInfoState"').then(out => settoggleContentState(out === 'true')) });

    function changeNoiseGridImage() {
        const currentPath = noiseGridImage.get();
        (currentPath.includes("variant1") ? setnoiseGridImage(`${HOME_DIR}/.config/ags/assets/NoiseGrid-variant2.svg`) : setnoiseGridImage(`${HOME_DIR}/.config/ags/assets/NoiseGrid-variant1.svg`))
    }
    interval(500, () => { changeNoiseGridImage() })
    createBindingCommandTableSetter({
            [`iwconfig wlan0 | grep ESSID | cut -d '"' -f 2`]: setcurrentSSID,
            [`iwconfig wlan0 | grep Mode | tr -s ' ' | cut -d ' ' -f 2`]: setinterfaceMode,
            [`iwconfig wlan0 | grep Frequency | tr -s ' ' | cut -d ' ' -f 3-4 | cut -d ':' -f2`]: setfrequency,
            [`nmcli device show | grep IP4.DNS | tr -s ' ' | cut -d ' ' -f 2 | paste -d ' ' -s`]: setdnsServers,
            [`iwconfig wlan0 | grep Access | tr -s ' ' | cut -d ' ' -f 7`]: setcurrentMAC,
            [`ip a | grep --after-context 4 wlan0 | grep altname | tr -s ' ' | cut -d ' ' -f 3 | head -n2 | paste -d ',' - -`]: setaltInterfaceName,
            [`ifconfig wlan0 | grep netmask | tr -s ' ' | cut -d ' ' -f 5`]: setcurrentSubnet,
            [`lsof -i -P -n | grep LISTEN | wc -l`]: setopenPorts,
            [`ip address | grep --after-context 1 'enp\|eth\|wl\|wlan' | grep inet | cut -d ' ' -f 6,13 | head -n 1`]: setlocalIp,
            [`iwconfig wlan0 | grep Bit | tr -s ' ' | cut -d ' ' -f 2-4 | cut -d '=' -f 2`]: setcurrentBitrate,
            [`ifconfig wlan0 | grep TX | head -n1 | tr -s ' ' | cut -d ' ' -f 7-`]: settransmitByte,
            [`lsof -i -P | grep TCP | wc -l`]: settcpConnection,
            [`ip route show | grep default | cut -d ' ' -f3,5 | head -n 1`]: setgatewayIp,
            [`iwconfig wlan0 | grep Link | tr -s ' ' | cut -d ' ' -f 2-3 | cut -d '=' -f 2`]: setlinkQuality,
            [`ifconfig wlan0 | grep RX | head -n1 | tr -s ' ' | cut -d ' ' -f 7-`]: setreceiveByte,
            [`lsof -i -P | grep UDP | wc -l`]: setudpConnection,
        }, {
            transform: (value) => value.toUpperCase().trim(),
            onError: (_, error) => console.log(error),
        });

    createBindingCommandTableSetter({
        [`journalctl -b --grep=network | tail -n 13`]: setJournalNetwork,
        [`nmcli dev`]: setNetworkDevice,
        [`nmcli dev wifi list | head -n 10`]: setwifiList,
    });

    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="NETWORK" onClicked={() => panelClicked("NetworkInfo", settoggleContentState)}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
            <With value={toggleContentState}>
                {(v) => ( 
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} halign={Align.FILL} valign={Align.LEFT} homogeneous={false} hexpand={false}>
                            <box homogeneous={false} halign={Align.FILL} hexpand={true}>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CURRENT SSID" value={currentSSID} important allowCopy/>
                                    <CreateEntryContent name="INTERFACE MODE" value={interfaceMode} allowCopy/>
                                    <CreateEntryContent name="FREQUENCY" value={frequency} allowCopy/>
                                    <CreateEntryContent name="DNS SERVERS" value={dnsServers} allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CURRENT MAC" value={currentMAC} important allowCopy/>
                                    <CreateEntryContent name="ALT INTERFACE NAME" value={altInterfaceName} />
                                    <CreateEntryContent name="CURRENT SUBNET" value={currentSubnet} />
                                    <CreateEntryContent name="OPEN PORTS" value={openPorts} important />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="LOCAL IP" value={localIp} important allowCopy/>
                                    <CreateEntryContent name="CURRENT BITRATE" value={currentBitrate} />
                                    <CreateEntryContent name="TRANSMIT BYTE" value={transmitByte} />
                                    <CreateEntryContent name="TCP CONNECTION" value={tcpConnection} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL}>
                                    <CreateEntryContent name="GATEWAY IP" value={gatewayIp} important allowCopy/>
                                    <CreateEntryContent name="LINK QUALITY" value={linkQuality} />
                                    <CreateEntryContent name="RECEIVE BYTE" value={receiveByte} />
                                    <CreateEntryContent name="UDP CONNECTION" value={udpConnection} />
                                </box>
                            </box>
                        </box>
                        <box cssClasses={["NoiseGrid"]}>
                            <With value={noiseGridImage}> 
                                {(path) => ( <Gtk.Picture file={Gio.File.new_for_path(path)} halign={Align.FILL} /> )} 
                            </With>
                        </box>
                        <box cssClasses={["extended-content"]} css={"font-size: 4px;"} hexpand={false} halign={Align.FILL}>
                            <scrolledwindow minContentWidth={100} minContentHeight={55} hexpand={true}>
                                <box valign={Align.LEFT} homogeneous={false} spacing={20}>
                                    <label label={journalNetwork} valign={Align.LEFT} halign={Align.LEFT} />
                                    <label label={networkDevice} valign={Align.LEFT} halign={Align.LEFT} />
                                    <label label={wifiList} valign={Align.LEFT} halign={Align.LEFT} />
                                </box>
                            </scrolledwindow>
                        </box>
                    </box>
                )}
            </With>
        </box>
    )
}
