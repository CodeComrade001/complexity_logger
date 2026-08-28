// ==============================
// ENUM: All Supported Task Actions
// ==============================
export enum CancelType {
  CANCEL = "cancel",
  PAUSE = "pause",
  FORCE_STOP = "force_stop",
  RESUME = "resume",
}



// ==============================
// INTERFACE: Defines the handlers
// ==============================
export interface CancelTaskProps {
  pause(): any;
  force_stop(): any;
  cancel(): any;
  resume(): any; // optional
}



// ==============================
// CLASS: Main Controller
// ==============================

export class CancelRunningTask implements CancelTaskProps {
  pause() {
    return true;
  }

  force_stop() {
    return true;
  }

  cancel() {
    return true;
  }

  resume() {
    return true;
  }
}
