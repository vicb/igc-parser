import * as turf from "@turf/turf";

import {Fix} from "./read-flight";
import Task from "./task";
import {Cylinder} from "./oz";
import {TakeoffDetector} from "./takeoff-detector";
import {FinishPoint, StartPoint, TaskPoint} from "./task-points";


class FlightAnalyzer {
  task: Task;
  startPoint: StartPoint;
  finishPoint: FinishPoint;
  taskPoints: TaskPoint[];
  _lastFix: Fix | undefined;
  _nextTP = 0;
  _aatPoints: any[] = [];
  private _takeoffDetector = new TakeoffDetector();

  constructor(task: Task) {
    this.task = task;
    this.startPoint = new StartPoint(task.points[0]!.observationZone);
    this.finishPoint = new FinishPoint(task.points[task.points.length - 1]!.observationZone);
    this.taskPoints = task.points.map(point => new TaskPoint(point.observationZone));
    this._lastFix = undefined;
    this._nextTP = 0;
    this._aatPoints = [];
  }

  update(fix: Fix) {
    this._takeoffDetector.update(fix);

    if (!this._lastFix) {
      this._lastFix = fix;
      return;
    }

    if (this.taskFinished) {
      return;
    }

    if (!this.reachedFirstTurnpoint) {
      let point = this.startPoint.checkStart(this._lastFix.coordinate, fix.coordinate);
      if (point) {
        this._aatPoints[0] = { coordinate: point.geometry.coordinates, time: fix.time};
        this._nextTP = 1;
      }
    }

    if (this.onFinalLeg) {
      let point = this.finishPoint.checkFinish(this._lastFix.coordinate, fix.coordinate);
      if (point) {
        this._aatPoints[this._nextTP] = { coordinate: point.geometry.coordinates, time: fix.time};
        this._nextTP += 1;
        return;
      }
    }

    let point = this.taskPoints[this._nextTP].checkTransition(this._lastFix.coordinate, fix.coordinate);
    if (point) {
      this._nextTP += 1;
    }

    if (this._nextTP > 1 && (this.task.points[this._nextTP - 1].observationZone as Cylinder).isInside(fix.coordinate)) {
      let _score =
        turf.distance(fix.coordinate, this.task.points[this._nextTP - 2].observationZone.center) +
        turf.distance(fix.coordinate, this.task.points[this._nextTP].observationZone.center);

      let _lastScore = (this._aatPoints[this._nextTP - 1] && this._aatPoints[this._nextTP - 1]._score) || 0;
      if (_score > _lastScore) {
        this._aatPoints[this._nextTP - 1] = {_score, coordinate: fix.coordinate, time: fix.time};
      }
    }

    this._lastFix = fix;
  }

  get reachedFirstTurnpoint(): boolean {
    return this._nextTP >= 2;
  }

  get onFinalLeg(): boolean {
    return this._nextTP === this.task.points.length - 1;
  }

  get taskFinished(): boolean {
    return this._nextTP >= this.task.points.length;
  }

  get result() {
    let start = this._aatPoints[0];
    let finish = this._aatPoints[this._aatPoints.length - 1];
    let totalTime = finish.time - start.time;

    let distance = 0;
    for (let i = 0; i < this._aatPoints.length - 1; i++) {
      distance += turf.distance(this._aatPoints[i].coordinate, this._aatPoints[i + 1].coordinate);
    }

    let speed = distance / (totalTime / 3600000);

    return { start, finish, totalTime, aatPoints: this._aatPoints, distance, speed };
  }
}

export function analyzeFlight(flight: Fix[], task: Task) {
  let analyzer = new FlightAnalyzer(task);

  flight.forEach(fix => analyzer.update(fix));

  return analyzer.result;
}
