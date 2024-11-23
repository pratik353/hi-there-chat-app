import { Input } from "../ui/input";

interface Props extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}

const InputField = ({ label, className, error, ...props }: Props) => {
  return (
    <div className={className}>
      <label>{label}</label>
      <Input {...props} />
      {error ? <p className="text-red-500">{error}</p> : null}
    </div>
  );
};

export default InputField;
