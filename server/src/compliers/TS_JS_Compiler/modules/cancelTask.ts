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
    console.log("Task paused");
    return true;
  }

  force_stop() {
    console.log("Task force-stopped");
    return true;
  }

  cancel() {
    console.log("Task canceled");
    return true;
  }

  resume() {
    console.log("Task resumed");
    return true;
  }
}
