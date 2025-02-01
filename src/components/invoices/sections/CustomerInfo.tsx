type CustomerInfoProps = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export function CustomerInfo({ firstName, lastName, email, phoneNumber }: CustomerInfoProps) {
  return (
    <div>
      <h2 className="font-semibold mb-2 text-[#1A1F2C]">Facturer à / Bill To:</h2>
      <div className="space-y-1">
        <p className="text-[#1A1F2C]">{firstName} {lastName}</p>
        <p className="text-[#8E9196]">{email}</p>
        <p className="text-[#8E9196]">{phoneNumber}</p>
      </div>
    </div>
  );
}