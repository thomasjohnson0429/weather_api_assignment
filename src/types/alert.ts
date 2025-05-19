export interface AlertGeometry {
  type: string;
  coordinates: number[][][];
}

export interface AlertDescription {
  language: string;
  event: string;
  headline: string;
  description: string;
  instruction: string;
}

export interface Alert {
  alert: {
    id: string;
    geometry: AlertGeometry;
  };
  msg_type: string;
  categories: string[];
  urgency: string;
  severity: string;
  certainty: string;
  start: number;
  end: number;
  sender: string;
  description: AlertDescription[];
}

export interface AlertRequest {
  alert: Alert;
}
