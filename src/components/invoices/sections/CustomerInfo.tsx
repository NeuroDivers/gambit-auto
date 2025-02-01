type CustomerInfoProps = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export function CustomerInfo({ firstName, lastName, email, phoneNumber }: CustomerInfoProps) {
  return (
    <div className="border-t pt-4">
      <h2 className="font-semibold mb-2 text-[#222222]">Customer Information</h2>
      <p className="text-[#333333]">{firstName} {lastName}</p>
      <p className="text-[#333333]">{email}</p>
      <p className="text-[#333333]">{phoneNumber}</p>
    </div>
  );
}