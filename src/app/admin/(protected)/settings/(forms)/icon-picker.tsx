"use client";

import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import Icon from "@/components/icons/Icon";

interface IconPickerProps {
    iconNames: string[];
    selectedIcon: string;
    onSelect: (icon: string) => void;
}

const IconPickerContent = ({ iconNames, selectedIcon, onSelect }: IconPickerProps) => {
    const [search, setSearch] = useState("");

    const filteredIcons = useMemo(() => {
        if (!search) return iconNames.slice(0, 50);
        return iconNames
            .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 50);
    }, [iconNames, search]);

    return (
        <>
            <CommandInput
                placeholder="Search icon..."
                className="h-9"
                onValueChange={setSearch}
            />
            <CommandList>
                <CommandEmpty>No icon found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-y-auto">
                    {filteredIcons.map((iconName) => (
                        <CommandItem
                            value={iconName}
                            key={iconName}
                            onSelect={() => onSelect(iconName)}
                            className="flex items-center gap-2"
                        >
                            <Check className={cn("h-4 w-4", selectedIcon === iconName ? "opacity-100" : "opacity-0")} />
                            <Icon name={iconName} className="h-4 w-4" />
                            <span className="truncate">{iconName}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </>
    );
};

export default IconPickerContent;
