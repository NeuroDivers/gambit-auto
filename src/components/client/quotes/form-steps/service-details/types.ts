
export interface ServiceDetailFieldProps {
  value: Record<string, any>;
  onChange: (details: Record<string, any>) => void;
}

export interface AutoDetailingFieldProps extends ServiceDetailFieldProps {}
export interface PPFPackageFieldProps extends ServiceDetailFieldProps {}
export interface WindowTintFieldProps extends ServiceDetailFieldProps {}
