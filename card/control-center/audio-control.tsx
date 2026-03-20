import { Align } from "../../helper"
import { Corner, drawChamferedBackground } from "../../helper/draw-function"



drawChamferedBackground
export default function AudioControl() {
    return (
        <box marginTop={5}>
            <overlay>
                <box css={`min-height: 50px;`}>
                    <drawingarea halign={Align.FILL} valign={Align.FILL} hexpand $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedBackground({area, cr, width, height, notchSize: 20, backgroundColor: "#000000", backgroundAlpha: 0.13, borderAlpha: 1.0, borderColor: "#0B1233", borderSize: 1.7, notchPlacements: [{corner: Corner.BottomRight}], }))} />
                </box>
                <box cssClasses={["content"]} $type="overlay">
                    <label label="abc" valign={Align.TOP} halign={Align.LEFT} />
                </box>
            </overlay>
        </box>
    )
}