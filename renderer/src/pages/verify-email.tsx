import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { verifyEmail } from "../store/auth/authSlice";
import { NeuralBackground } from "../components/ui/display/NeuralBackground";
import { ContextLogo } from "../components/ui/core/ContextLogo";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  // Guard against React StrictMode double-invocation in development.
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token || hasVerified.current) return;
    hasVerified.current = true;

    dispatch(verifyEmail(token))
      .unwrap()
      .then(() => {
        setTimeout(() => {
          navigate("/workspace", { replace: true });
        }, 2000);
      })
      .catch(() => {
        // Error is stored in Redux state, shown in the UI below
      });
  }, [token, dispatch, navigate]);

  const isLoading = status === "loading";
  const isSuccess = status === "succeeded";
  const isFailed = status === "failed" || !token;

  return (
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text antialiased font-sans h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-light-surface/50 to-light-bg dark:from-transparent dark:via-dark-bg/80 dark:to-dark-bg" />
        <NeuralBackground />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-light-primary/10 dark:bg-dark-primary/10 blur-[100px] rounded-full animate-pulse-slow" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/90 dark:bg-[#18181B]/90 border border-light-border dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Top accent bar */}
          <div className="w-full h-1.5 bg-light-bg dark:bg-white/5 relative">
            <div
              className="absolute top-0 left-0 h-full bg-light-primary dark:bg-dark-primary shadow-[0_0_15px_rgba(16,55,102,0.5)] dark:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-1000"
              style={{ width: isLoading ? "60%" : "100%" }}
            />
          </div>

          <div className="flex flex-col items-center text-center p-10 gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3 group">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-light-primary/20 dark:bg-dark-primary/20 rounded-xl blur-md opacity-60" />
                <div className="relative w-full h-full bg-light-surface dark:bg-dark-surface/80 border border-light-border dark:border-white/10 rounded-xl flex items-center justify-center shadow-sm z-10">
                  <ContextLogo className="w-5 h-5" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-light-primary dark:text-white font-mono">Context</span>
            </div>

            {/* State: Loading */}
            {isLoading && (
              <>
                <div className="w-20 h-20 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 border border-light-primary/20 dark:border-dark-primary/20 flex items-center justify-center">
                  <span className="material-symbols-rounded text-4xl text-light-primary dark:text-dark-primary animate-spin">sync</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-light-text dark:text-white font-display mb-2">Verifying your email...</h2>
                  <p className="text-sm text-light-text/60 dark:text-white/50">Please wait a moment.</p>
                </div>
              </>
            )}

            {/* State: Success */}
            {isSuccess && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <span className="material-symbols-rounded text-4xl text-green-500">check_circle</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-light-text dark:text-white font-display mb-2">Email verified!</h2>
                  <p className="text-sm text-light-text/60 dark:text-white/50">Welcome to Context. Redirecting you to your workspace...</p>
                </div>
              </>
            )}

            {/* State: Error */}
            {isFailed && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <span className="material-symbols-rounded text-4xl text-red-400">error</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-light-text dark:text-white font-display mb-2">Verification failed</h2>
                  <p className="text-sm text-light-text/60 dark:text-white/50 leading-relaxed">
                    {error || "This verification link is invalid or has expired."}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 w-full pt-2 border-t border-light-border dark:border-white/5">
                  <p className="text-xs text-light-text/40 dark:text-white/30">Try registering again or contact support</p>
                  <Link
                    to="/register"
                    className="text-sm font-bold text-light-primary dark:text-dark-primary hover:opacity-80 transition-opacity"
                  >
                    Back to Register
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
