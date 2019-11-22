declare namespace IGCParser {
    interface Options {
        lenient?: boolean;
    }
    interface IGCFile {
        /** UTC date of the flight in ISO 8601 format */
        date: string;
        numFlight: number | null;
        pilot: string | null;
        copilot: string | null;
        gliderType: string | null;
        registration: string | null;
        callsign: string | null;
        competitionClass: string | null;
        loggerId: string;
        loggerManufacturer: string;
        loggerType: string | null;
        firmwareVersion: string | null;
        hardwareVersion: string | null;
        task: Task | null;
        fixes: BRecord[];
        dataRecords: KRecord[];
        security: string | null;
        errors: Error[];
    }
    interface PartialIGCFile extends Partial<IGCFile> {
        fixes: BRecord[];
        dataRecords: KRecord[];
    }
    interface ARecord {
        manufacturer: string;
        loggerId: string;
        numFlight: number | null;
        additionalData: string | null;
    }
    interface BRecord {
        /** Unix timestamp of the GPS fix in milliseconds */
        timestamp: number;
        /** UTC time of the GPS fix in ISO 8601 format */
        time: string;
        latitude: number;
        longitude: number;
        valid: boolean;
        pressureAltitude: number | null;
        gpsAltitude: number | null;
        extensions: RecordExtensions;
        fixAccuracy: number | null;
        /** Engine Noise Level from 0.0 to 1.0 */
        enl: number | null;
    }
    interface KRecord {
        /** Unix timestamp of the data record in milliseconds */
        timestamp: number;
        /** UTC time of the data record in ISO 8601 format */
        time: string;
        extensions: RecordExtensions;
    }
    interface RecordExtensions {
        [code: string]: string;
    }
    interface RecordExtension {
        code: string;
        start: number;
        length: number;
    }
    interface Task {
        declarationDate: string;
        declarationTime: string;
        declarationTimestamp: number;
        flightDate: string | null;
        taskNumber: number | null;
        numTurnpoints: number;
        comment: string | null;
        points: TaskPoint[];
    }
    interface TaskPoint {
        latitude: number;
        longitude: number;
        name: string | null;
    }
}
declare class IGCParser {
    private _result;
    private fixExtensions;
    private dataExtensions;
    private lineNumber;
    private prevTimestamp;
    static parse(str: string, options?: IGCParser.Options): IGCParser.IGCFile;
    get result(): IGCParser.IGCFile;
    private processLine;
    private processHeader;
    private parseARecord;
    private parseDateHeader;
    private parseTextHeader;
    private parsePilot;
    private parseCopilot;
    private parseGliderType;
    private parseRegistration;
    private parseCallsign;
    private parseCompetitionClass;
    private parseLoggerType;
    private parseFirmwareVersion;
    private parseHardwareVersion;
    private processTaskLine;
    private parseTask;
    private parseTaskPoint;
    private parseBRecord;
    private parseKRecord;
    private parseIJRecord;
    private static parseLatitude;
    private static parseLongitude;
    /**
     * Figures out a Unix timestamp in milliseconds based on the
     * date header value, the time field in the current record and
     * the previous timestamp.
     */
    private calcTimestamp;
}
export = IGCParser;