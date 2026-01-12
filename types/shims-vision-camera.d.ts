declare module "react-native-vision-camera" {
  import * as React from "react";

  export type CameraPermissionStatus =
    | "granted"
    | "denied"
    | "restricted"
    | "not-determined";

  export interface CameraProps {
    style?: any;
    device: any;
    isActive: boolean;
    zoom: any;
    format: any;
    torch?: "on" | "off";
    codeScanner?: any;
  }

  export const Camera: React.ComponentType<CameraProps>;

  export function useCameraDevice(position: 'front' | 'back'): any | undefined;

  export interface Code {
    frame: any;
    value?: string | null;
    type?: string;
  }

  export function useCodeScanner(config: {
    codeTypes: string[];
    onCodeScanned: (codes: Code[]) => void;
  }): any;

  export function requestCameraPermission(): Promise<CameraPermissionStatus>;
  export function getCameraPermissionStatus(): Promise<CameraPermissionStatus>;
}

declare module "react-native-image-picker" {
  export interface ImageLibraryOptions {
    mediaType?: "photo" | "video" | "mixed";
    includeBase64?: boolean;
    selectionLimit?: number;
  }

  export interface Asset {
    fileName?: string;
    uri?: string;
  }

  export interface ImagePickerResponse {
    didCancel?: boolean;
    assets?: Asset[];
  }

  export function launchImageLibrary(
    options: ImageLibraryOptions
  ): Promise<ImagePickerResponse>;
}
