import { Gtk } from "ags/gtk4"
import { Align, HOME_DIR, ICON_DIR } from "../../helper"
import { Corner, drawChamferedBackground } from "../../helper/draw-function"
import CreateUtilityButton from "../../helper/create-utility-button"
import { execAsync } from "ags/process"

export default function NetworkControl() {
    const openNMTUI = () => execAsync(`foot -e nmtui`)
    return (
        <box marginTop={10}>
            <overlay>
                <box css={`min-height: 50px;`}>
                    <drawingarea halign={Align.FILL} valign={Align.FILL} hexpand $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedBackground({area, cr, width, height, notchSize: 13, backgroundColor: "#000000", backgroundAlpha: 0.13, borderAlpha: 1.0, borderColor: "#0B1233", borderSize: 1.7, notchPlacements: [{corner: Corner.BottomRight}], }))} />
                </box>
                <box cssClasses={["content"]} $type="overlay" orientation={Gtk.Orientation.VERTICAL} spacing={5}>
                    <box spacing={5} valign={Align.TOP} halign={Align.LEFT}>
                        <image file={`${HOME_DIR}/.config/ags/assets/ornament/frame-01.svg`} pixelSize={15}/>
                        <label cssClasses={["title"]} label="NETWORK CONTROL"/>
                        <CreateUtilityButton imageFile={`${ICON_DIR}/majesticons--open.svg`} tooltipText={"Open nmtui for network management\n\nConfigure WiFi connections,\nedit network settings"} pixelSize={8} onClicked={openNMTUI}/>
                    </box>
                </box>
            </overlay>
        </box>
    )
}