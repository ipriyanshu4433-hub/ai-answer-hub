import { motion } from "framer-motion";
import SearchInterface from "@/components/search/SearchInterface";

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground"
    >
      <SearchInterface />
    </motion.div>
  );
}