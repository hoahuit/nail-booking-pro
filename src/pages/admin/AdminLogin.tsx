import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";

const AdminLogin = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const navigate = useNavigate();
  const login    = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login.mutateAsync({ email, password }).catch(() => null);
    if (result) {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-12 space-y-2">
          <span className="font-serif text-4xl tracking-wide text-primary-foreground">
            LUXE NAILS
          </span>
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary-foreground/35 mt-2">
            Cổng quản trị
          </p>
          <div className="w-12 h-px bg-primary-foreground/15 mx-auto mt-5" />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[10px] tracking-[0.18em] uppercase text-primary-foreground/45"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/25" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12 rounded-none bg-primary-foreground/[0.06] border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/25 focus-visible:ring-0 focus-visible:border-primary-foreground/35"
                placeholder="admin@example.com"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[10px] tracking-[0.18em] uppercase text-primary-foreground/45"
            >
              Mật khẩu
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/25" />
              <Input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11 h-12 rounded-none bg-primary-foreground/[0.06] border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/25 focus-visible:ring-0 focus-visible:border-primary-foreground/35"
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/35 hover:text-primary-foreground/60 transition-colors"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={login.isPending || !email || !password}
            className="w-full rounded-none h-12 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 text-[10px] tracking-[0.22em] uppercase disabled:opacity-30 transition-colors"
          >
            {login.isPending ? "Đang đăng nhập…" : "Đăng nhập"}
          </Button>
        </form>

        <p className="mt-10 text-center text-[10px] tracking-wider text-primary-foreground/18 uppercase">
          Luxe Nails Quản trị · 2026
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
