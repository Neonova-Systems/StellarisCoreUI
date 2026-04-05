import { createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { interval } from "ags/time";
import Gio from "gi://Gio?version=2.0";
import { CreateEntryContent, CreatePanel, HOME_DIR, panelClicked, playSound, AudioFile, Align, createBindingCommandTableSetter } from "../../helper";
import { cycleAssetVariant, initToggleState } from "../../helper/behaviour";
import CreateCard from '../../helper/create-card';

export default function NetworkInfo() {
    const [currentSSID, setCurrentSSID] = createState("");
    const [interfaceMode, setInterfaceMode] = createState("");
    const [frequency, setFrequency] = createState("");
    const [dnsServers, setDnsServers] = createState("");
    const [currentMAC, setCurrentMAC] = createState("");
    const [altInterfaceName, setAltInterfaceName] = createState("");
    const [currentSubnet, setCurrentSubnet] = createState("");
    const [openPorts, setOpenPorts] = createState("");
    const [localIp, setLocalIp] = createState("");
    const [currentBitrate, setCurrentBitrate] = createState("");
    const [transmitByte, setTransmitByte] = createState("");
    const [tcpConnection, setTcpConnection] = createState("");

    const [gatewayIp, setGatewayIp] = createState("");
    const [linkQuality, setLinkQuality] = createState("");
    const [receiveByte, setReceiveByte] = createState("");
    const [udpConnection, setUdpConnection] = createState("");
    const [journalNetwork, setJournalNetwork] = createState("");
    const [networkDevice, setNetworkDevice] = createState("");
    const [wifiList, setWifiList] = createState("");
    const [toggleContentState, setToggleContentState] = createState(false);
    const [noiseGridImage, setNoiseGridImage] = createState(`${HOME_DIR}/.config/ags/assets/NoiseGrid-variant1.svg`);

    playSound(AudioFile.Panel, 1500);
    initToggleState("NetworkInfo", setToggleContentState);

    interval(500, () => {
        setNoiseGridImage((currentPath) => cycleAssetVariant(currentPath, [
            `${HOME_DIR}/.config/ags/assets/NoiseGrid-variant1.svg`,
            `${HOME_DIR}/.config/ags/assets/NoiseGrid-variant2.svg`,
        ]));
    });
    createBindingCommandTableSetter({
            [`iwconfig wlan0 | grep ESSID | cut -d '"' -f 2`]: setCurrentSSID,
            [`iwconfig wlan0 | grep Mode | tr -s ' ' | cut -d ' ' -f 2`]: setInterfaceMode,
            [`iwconfig wlan0 | grep Frequency | tr -s ' ' | cut -d ' ' -f 3-4 | cut -d ':' -f2`]: setFrequency,
            [`nmcli device show | grep IP4.DNS | tr -s ' ' | cut -d ' ' -f 2 | paste -d ' ' -s`]: setDnsServers,
            [`iwconfig wlan0 | grep Access | tr -s ' ' | cut -d ' ' -f 7`]: setCurrentMAC,
            [`ip a | grep --after-context 4 wlan0 | grep altname | tr -s ' ' | cut -d ' ' -f 3 | head -n2 | paste -d ',' - -`]: setAltInterfaceName,
            [`ifconfig wlan0 | grep netmask | tr -s ' ' | cut -d ' ' -f 5`]: setCurrentSubnet,
            [`lsof -i -P -n | grep LISTEN | wc -l`]: setOpenPorts,
            [`ip address | grep --after-context 1 'enp\|eth\|wl\|wlan' | grep inet | cut -d ' ' -f 6,13 | head -n 1`]: setLocalIp,
            [`iwconfig wlan0 | grep Bit | tr -s ' ' | cut -d ' ' -f 2-4 | cut -d '=' -f 2`]: setCurrentBitrate,
            [`ifconfig wlan0 | grep TX | head -n1 | tr -s ' ' | cut -d ' ' -f 7-`]: setTransmitByte,
            [`lsof -i -P | grep TCP | wc -l`]: setTcpConnection,
            [`ip route show | grep default | cut -d ' ' -f3,5 | head -n 1`]: setGatewayIp,
            [`iwconfig wlan0 | grep Link | tr -s ' ' | cut -d ' ' -f 2-3 | cut -d '=' -f 2`]: setLinkQuality,
            [`ifconfig wlan0 | grep RX | head -n1 | tr -s ' ' | cut -d ' ' -f 7-`]: setReceiveByte,
            [`lsof -i -P | grep UDP | wc -l`]: setUdpConnection,
        }, {
            transform: (value) => value.toUpperCase().trim(),
            onError: (_, error) => console.log(error),
        });

    createBindingCommandTableSetter({
        [`journalctl -b --grep=network | tail -n 13`]: setJournalNetwork,
        [`nmcli dev`]: setNetworkDevice,
        [`nmcli dev wifi list | head -n 10`]: setWifiList,
    });

    function renderContent() {
        return (
            <box cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
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
        )
    }

    return (
        <CreateCard state={toggleContentState} cardContent={renderContent()}>
            <CreatePanel name="NETWORK" onClicked={() => panelClicked("NetworkInfo", setToggleContentState)}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
        </CreateCard>
    )
}
