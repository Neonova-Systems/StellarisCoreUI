import { createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { interval } from "ags/time";
import Adw from "gi://Adw?version=1";
import Gio from "gi://Gio?version=2.0";
import { CreateEntryContent, CreatePanel, HOME_DIR, panelClicked, playSound, AudioFile, Align, createBindingCommandTableSetter, getLocalIP, getNMGatewayIP } from "../../helper";
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
    [`iwconfig wlan0 | grep Bit | tr -s ' ' | cut -d ' ' -f 2-4 | cut -d '=' -f 2`]: setCurrentBitrate,
    [`ifconfig wlan0 | grep TX | head -n1 | tr -s ' ' | cut -d ' ' -f 7-`]: setTransmitByte,
    [`lsof -i -P | grep TCP | wc -l`]: setTcpConnection,
    [`iwconfig wlan0 | grep Link | tr -s ' ' | cut -d ' ' -f 2-3 | cut -d '=' -f 2 | paste -d ' ' - -`]: setLinkQuality,
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

  setGatewayIp(() => getNMGatewayIP())
  setLocalIp(() => getLocalIP())
  function renderContent() {
    return (
      <box cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
        <box cssClasses={["mx-2", "mt-2", "min-h-12"]}>
          <With value={noiseGridImage}>
            {(path) => (<Gtk.Picture file={Gio.File.new_for_path(path)} halign={Align.FILL} />)}
          </With>
        </box>
        <overlay cssClasses={["entry"]}>
          <Adw.Clamp maximumSize={600} cssClasses={["mx-2"]}>
            <Gtk.Picture cssClasses={["min-h-48"]} file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/ornament/sattelite.png`)} halign={Align.FILL} contentFit={Gtk.ContentFit.FILL} canShrink={true} />
          </Adw.Clamp>

          <box $type="overlay" halign={Align.LEFT} cssClasses={["mt-3", "ml-2"]} hexpand spacing={5} orientation={Gtk.Orientation.VERTICAL}>
            <CreateEntryContent type="overlay" name="CURRENT SSID" value={currentSSID} orientation={Gtk.Orientation.HORIZONTAL} important allowCopy hexpand />
            <CreateEntryContent name="CURRENT SUBNET" value={currentSubnet} />
          </box>
          <box $type="overlay" halign={Align.RIGHT} cssClasses={["mt-3", "mr-2",]} hexpand spacing={5} orientation={Gtk.Orientation.VERTICAL}>
            <CreateEntryContent name="CURRENT MAC" value={currentMAC} important allowCopy orientation={Gtk.Orientation.HORIZONTAL} hexpand />
          </box>
          <box $type="overlay" halign={Align.RIGHT} valign={Align.BOTTOM} cssClasses={["mt-3", "mr-2"]} spacing={8}>
            <CreateEntryContent name="OPEN PORTS" value={openPorts} important orientation={Gtk.Orientation.HORIZONTAL} />
            <CreateEntryContent name="TCP CONNECTION" value={tcpConnection} orientation={Gtk.Orientation.HORIZONTAL} />
            <CreateEntryContent name="UDP CONNECTION" value={udpConnection} orientation={Gtk.Orientation.HORIZONTAL} />
          </box>
          <box $type="overlay" halign={Align.LEFT} valign={Align.BOTTOM} cssClasses={["mt-3", "ml-2"]} spacing={5} orientation={Gtk.Orientation.VERTICAL}>
            <CreateEntryContent name="LOCAL IP" value={localIp} important allowCopy orientation={Gtk.Orientation.HORIZONTAL} />
            <CreateEntryContent name="GATEWAY IP" value={gatewayIp} important allowCopy orientation={Gtk.Orientation.HORIZONTAL} />
            <CreateEntryContent name="DNS SERVERS" value={dnsServers} allowCopy orientation={Gtk.Orientation.HORIZONTAL} />
            <CreateEntryContent name="LINK QUALITY" value={linkQuality} orientation={Gtk.Orientation.HORIZONTAL} />
          </box>
          <box $type="overlay" halign={Align.RIGHT} valign={Align.BOTTOM} cssClasses={["mb-5", "mr-2"]} spacing={5}>
            <CreateEntryContent name="TRANSMIT BYTE" value={transmitByte} orientation={Gtk.Orientation.HORIZONTAL} />
            <CreateEntryContent name="RECEIVE BYTE" value={receiveByte} orientation={Gtk.Orientation.HORIZONTAL} />
          </box>
          <box $type="overlay" halign={Align.RIGHT} valign={Align.BOTTOM} cssClasses={["mb-10", "mr-2"]} spacing={5}>
            <CreateEntryContent name="CURRENT BITRATE" value={currentBitrate} orientation={Gtk.Orientation.HORIZONTAL} />
          </box>
          <box $type="overlay" halign={Align.CENTER} valign={Align.TOP} cssClasses={["mt-8"]} spacing={5}>
            <CreateEntryContent name="ALT INTERFACE NAME" value={altInterfaceName} orientation={Gtk.Orientation.HORIZONTAL} />
          </box>
          <box $type="overlay" halign={Align.LEFT} valign={Align.CENTER} cssClasses={["mb-12", "ml-2"]} spacing={5}>
            <CreateEntryContent name="FREQUENCY" value={frequency} allowCopy orientation={Gtk.Orientation.HORIZONTAL} />
          </box>
          <box $type="overlay" halign={Align.RIGHT} valign={Align.CENTER} cssClasses={["mb-12", "mr-12"]} spacing={5}>
            <CreateEntryContent name="INTERFACE MODE" value={interfaceMode} allowCopy />
          </box>
        </overlay>
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
    <CreateCard state={toggleContentState} cardContent={() => renderContent()}>
      <CreatePanel isActive={toggleContentState} name="NETWORK" onClicked={() => panelClicked("NetworkInfo", setToggleContentState)}>
        <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16} />
      </CreatePanel>
    </CreateCard>
  )
}
