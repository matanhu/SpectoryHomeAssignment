import { CONTROLS } from "../app.constants";
import { PositionModel } from "./position-model";

export class SnakeModel {
    public direction: CONTROLS;
    public vertebrals: Array<PositionModel>;
    
}
