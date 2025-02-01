type CustomerInfoProps = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export function CustomerInfo({ firstName, lastName, email, phoneNumber }: CustomerInfoProps) {
  return (
    <div className="border-t pt-4">
      <h2 className="font-semibold mb-2">Customer Information</h2>
      <p>{firstName} {lastName}</p>
      <p>{email}</p>
      <p>{phoneNumber}</p>
    </div>
  );
}