import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Key, Save } from "lucide-react";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [keys, setKeys] = useState({
    openai: "",
    gemini: "",
    groq: "",
  });

  useEffect(() => {
    // Load from local storage on mount
    const stored = localStorage.getItem("vly_api_keys");
    if (stored) {
      try {
        setKeys(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored keys", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("vly_api_keys", JSON.stringify(keys));
    toast.success("API Keys saved locally");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Settings (BYOK)
          </DialogTitle>
          <DialogDescription>
            Enter your own API keys to use the models. Keys are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="openai">OpenAI API Key</Label>
            <Input
              id="openai"
              type="password"
              value={keys.openai}
              onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
              placeholder="sk-..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gemini">Google Gemini API Key</Label>
            <Input
              id="gemini"
              type="password"
              value={keys.gemini}
              onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
              placeholder="AIza..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="groq">Groq API Key</Label>
            <Input
              id="groq"
              type="password"
              value={keys.groq}
              onChange={(e) => setKeys({ ...keys, groq: e.target.value })}
              placeholder="gsk_..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Keys
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
