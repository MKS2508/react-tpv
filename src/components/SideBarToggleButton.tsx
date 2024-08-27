import {Button} from "@/components/ui/button.tsx";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";

type SidebarToggleButtonProps = {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
};

const SidebarToggleButton = ({ isSidebarOpen, toggleSidebar }: SidebarToggleButtonProps) => {
    return (
        <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-0 z-10 bg-white dark:bg-gray-800"
            onClick={toggleSidebar}
        >
            {isSidebarOpen ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
        </Button>
    );
};

export default SidebarToggleButton;