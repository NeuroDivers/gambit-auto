import { Shield } from "lucide-react";

interface RoleStatsCardProps {
  role: string;
  count: number;
}

export const RoleStatsCard = ({ role, count }: RoleStatsCardProps) => {
  return (
    <div className="bg-[#242424] border border-white/12 rounded-lg p-4 transition-all duration-200 hover:border-[#BB86FC]/50">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[#BB86FC]/10 flex items-center justify-center">
          <Shield className="h-4 w-4 text-[#BB86FC]" />
        </div>
        <div>
          <p className="font-medium capitalize text-white/[0.87]">{role}s</p>
          <p className="text-sm text-white/60">
            Count: {count}
          </p>
        </div>
      </div>
    </div>
  );
};