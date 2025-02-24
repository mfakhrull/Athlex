"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Minus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimeInput({ 
  value, 
  onChange, 
  placeholder = "00:00:00.000",
  className 
}: TimeInputProps) {
  const [open, setOpen] = React.useState(false);
  const [hours, setHours] = React.useState("00");
  const [minutes, setMinutes] = React.useState("00");
  const [seconds, setSeconds] = React.useState("00");
  const [milliseconds, setMilliseconds] = React.useState("000");

  // Parse input value when it changes
  React.useEffect(() => {
    if (value) {
      const [timeStr, msStr] = value.split('.');
      const [hrs, mins, secs] = timeStr ? timeStr.split(':') : ['00', '00', '00'];
      setHours(hrs?.padStart(2, "0") || "00");
      setMinutes(mins?.padStart(2, "0") || "00");
      setSeconds(secs?.padStart(2, "0") || "00");
      setMilliseconds(msStr?.padStart(3, "0") || "000");
    } else {
      setHours("00");
      setMinutes("00");
      setSeconds("00");
      setMilliseconds("000");
    }
  }, [value]);

  const formatTime = () => {
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const updateTime = (
    type: "hours" | "minutes" | "seconds" | "milliseconds",
    delta: number
  ) => {
    let newValue = 0;
    switch (type) {
      case "hours":
        newValue = Math.max(0, Math.min(23, parseInt(hours) + delta));
        setHours(newValue.toString().padStart(2, "0"));
        break;
      case "minutes":
        newValue = Math.max(0, Math.min(59, parseInt(minutes) + delta));
        setMinutes(newValue.toString().padStart(2, "0"));
        break;
      case "seconds":
        newValue = Math.max(0, Math.min(59, parseInt(seconds) + delta));
        setSeconds(newValue.toString().padStart(2, "0"));
        break;
      case "milliseconds":
        newValue = Math.max(0, Math.min(999, parseInt(milliseconds) + delta));
        setMilliseconds(newValue.toString().padStart(3, "0"));
        break;
    }
    
    onChange(formatTime());
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "pr-8 font-mono",
              className
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
            onClick={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
          >
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-4" align="start">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center gap-2">
              <label className="text-xs text-muted-foreground">Hr</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateTime("hours", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Input
                className="h-9 w-full text-center font-mono"
                value={hours}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                    .toString()
                    .padStart(2, "0");
                  setHours(val);
                  onChange(`${val}:${minutes}:${seconds}.${milliseconds}`);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateTime("hours", -1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <label className="text-xs text-muted-foreground">Min</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateTime("minutes", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Input
                className="h-9 w-full text-center font-mono"
                value={minutes}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                    .toString()
                    .padStart(2, "0");
                  setMinutes(val);
                  onChange(`${hours}:${val}:${seconds}.${milliseconds}`);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateTime("minutes", -1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <label className="text-xs text-muted-foreground">Sec</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateTime("seconds", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Input
                className="h-9 w-full text-center font-mono"
                value={seconds}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                    .toString()
                    .padStart(2, "0");
                  setSeconds(val);
                  onChange(`${hours}:${minutes}:${val}.${milliseconds}`);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateTime("seconds", -1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <label className="text-xs text-muted-foreground">Ms</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateTime("milliseconds", 10)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Input
                className="h-9 w-full text-center font-mono"
                value={milliseconds}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(999, parseInt(e.target.value) || 0))
                    .toString()
                    .padStart(3, "0");
                  setMilliseconds(val);
                  onChange(`${hours}:${minutes}:${seconds}.${val}`);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateTime("milliseconds", -10)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-2 flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onChange(formatTime());
                setOpen(false);
              }}
            >
              Set Time
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}