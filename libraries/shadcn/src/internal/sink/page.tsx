import { AccordionDemo } from "@/internal/sink/components/accordion-demo";
import { AlertDemo } from "@/internal/sink/components/alert-demo";
import { AlertDialogDemo } from "@/internal/sink/components/alert-dialog-demo";
import { AppSidebar } from "@/internal/sink/components/app-sidebar";
import { AspectRatioDemo } from "@/internal/sink/components/aspect-ratio-demo";
import { AvatarDemo } from "@/internal/sink/components/avatar-demo";
import { BadgeDemo } from "@/internal/sink/components/badge-demo";
import { BadgeDestructive } from "@/internal/sink/components/badge-destructive";
import { BadgeOutline } from "@/internal/sink/components/badge-outline";
import { BadgeSecondary } from "@/internal/sink/components/badge-secondary";
import { BreadcrumbDemo } from "@/internal/sink/components/breadcrumb-demo";
import { ButtonDemo } from "@/internal/sink/components/button-demo";
import { ButtonDestructive } from "@/internal/sink/components/button-destructive";
import { ButtonGhost } from "@/internal/sink/components/button-ghost";
import { ButtonLink } from "@/internal/sink/components/button-link";
import { ButtonLoading } from "@/internal/sink/components/button-loading";
import { ButtonOutline } from "@/internal/sink/components/button-outline";
import { ButtonSecondary } from "@/internal/sink/components/button-secondary";
import { ButtonWithIcon } from "@/internal/sink/components/button-with-icon";
import { CalendarDemo } from "@/internal/sink/components/calendar-demo";
import { CardDemo } from "@/internal/sink/components/card-demo";
import { CarouselDemo } from "@/internal/sink/components/carousel-demo";
import { CheckboxDemo } from "@/internal/sink/components/checkbox-demo";
import { CollapsibleDemo } from "@/internal/sink/components/collapsible-demo";
import { ComboboxDemo } from "@/internal/sink/components/combobox-demo";
import { CommandDemo } from "@/internal/sink/components/command-demo";
import { ComponentWrapper } from "@/internal/sink/components/component-wrapper";
import { ContextMenuDemo } from "@/internal/sink/components/context-menu-demo";
import { DatePickerDemo } from "@/internal/sink/components/date-picker-demo";
import { DialogDemo } from "@/internal/sink/components/dialog-demo";
import { DrawerDemo } from "@/internal/sink/components/drawer-demo";
import { DropdownMenuDemo } from "@/internal/sink/components/dropdown-menu-demo";
import { HoverCardDemo } from "@/internal/sink/components/hover-card-demo";
import { InputDemo } from "@/internal/sink/components/input-demo";
import { InputOTPDemo } from "@/internal/sink/components/input-otp-demo";
import { LabelDemo } from "@/internal/sink/components/label-demo";
import { MenubarDemo } from "@/internal/sink/components/menubar-demo";
import { NavigationMenuDemo } from "@/internal/sink/components/navigation-menu-demo";
import { PaginationDemo } from "@/internal/sink/components/pagination-demo";
import { PopoverDemo } from "@/internal/sink/components/popover-demo";
import { ProgressDemo } from "@/internal/sink/components/progress-demo";
import { RadioGroupDemo } from "@/internal/sink/components/radio-group-demo";
import { ResizableHandleDemo } from "@/internal/sink/components/resizable-handle";
import { ScrollAreaDemo } from "@/internal/sink/components/scroll-area-demo";
import { SelectDemo } from "@/internal/sink/components/select-demo";
import { SeparatorDemo } from "@/internal/sink/components/separator-demo";
import { SheetDemo } from "@/internal/sink/components/sheet-demo";
import { SkeletonDemo } from "@/internal/sink/components/skeleton-demo";
import { SliderDemo } from "@/internal/sink/components/slider-demo";
import { SonnerDemo } from "@/internal/sink/components/sonner-demo";
import { SwitchDemo } from "@/internal/sink/components/switch-demo";
import { TableDemo } from "@/internal/sink/components/table-demo";
import { TabsDemo } from "@/internal/sink/components/tabs-demo";
import { TextareaDemo } from "@/internal/sink/components/textarea-demo";
import { ToastDemo } from "@/internal/sink/components/toast-demo";
import { ToggleDemo } from "@/internal/sink/components/toggle-demo";
import { ToggleDisabled } from "@/internal/sink/components/toggle-disabled";
import { ToggleGroupDemo } from "@/internal/sink/components/toggle-group-demo";
import { ToggleOutline } from "@/internal/sink/components/toggle-outline";
import { ToggleWithText } from "@/internal/sink/components/toggle-with-text";
import { TooltipDemo } from "@/internal/sink/components/tooltip-demo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb";
import { Separator } from "@/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/ui/sidebar";

export default function SinkPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ComponentWrapper name="Accordion">
              <AccordionDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Alert">
              <AlertDemo />
            </ComponentWrapper>
            <ComponentWrapper name="AlertDialog">
              <AlertDialogDemo />
            </ComponentWrapper>
            <ComponentWrapper name="AspectRatio">
              <AspectRatioDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Avatar">
              <AvatarDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Badge">
              <BadgeDemo />
              <BadgeDestructive />
              <BadgeOutline />
              <BadgeSecondary />
            </ComponentWrapper>
            <ComponentWrapper name="Breadcrumb">
              <BreadcrumbDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Button">
              <div className="flex items-center gap-2">
                <ButtonDemo />
                <ButtonDestructive />
                <ButtonGhost />
                <ButtonLink />
              </div>
              <div className="flex items-center gap-2">
                <ButtonLoading />
                <ButtonOutline />
                <ButtonSecondary />
              </div>
              <div className="flex items-center gap-2">
                <ButtonWithIcon />
              </div>
            </ComponentWrapper>
            <ComponentWrapper name="Calendar">
              <CalendarDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Card">
              <CardDemo className="w-full" />
            </ComponentWrapper>
            <ComponentWrapper
              name="Carousel"
              className="[&_.max-w-xs]:max-w-[70%]"
            >
              <CarouselDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Checkbox">
              <CheckboxDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Collapsible">
              <CollapsibleDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Combobox">
              <ComboboxDemo />
            </ComponentWrapper>
            <ComponentWrapper
              name="Command"
              className="[&_[cmdk-root]]:md:min-w-max"
            >
              <CommandDemo />
            </ComponentWrapper>
            <ComponentWrapper name="ContextMenu">
              <ContextMenuDemo />
            </ComponentWrapper>
            <ComponentWrapper name="DatePicker">
              <DatePickerDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Dialog">
              <DialogDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Drawer">
              <DrawerDemo />
            </ComponentWrapper>
            <ComponentWrapper name="DropdownMenu">
              <DropdownMenuDemo />
            </ComponentWrapper>
            <ComponentWrapper name="HoverCard">
              <HoverCardDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Input">
              <InputDemo />
            </ComponentWrapper>
            <ComponentWrapper name="InputOTP">
              <InputOTPDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Label">
              <LabelDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Menubar">
              <MenubarDemo />
            </ComponentWrapper>
            <ComponentWrapper name="NavigationMenu" className="col-span-2">
              <NavigationMenuDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Pagination">
              <PaginationDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Popover">
              <PopoverDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Progress">
              <ProgressDemo />
            </ComponentWrapper>
            <ComponentWrapper name="RadioGroup">
              <RadioGroupDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Resizable" className="col-span-2">
              <ResizableHandleDemo />
            </ComponentWrapper>
            <ComponentWrapper name="ScrollArea">
              <ScrollAreaDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Select">
              <SelectDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Separator">
              <SeparatorDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Sheet">
              <SheetDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Skeleton">
              <SkeletonDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Slider">
              <SliderDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Sonner">
              <SonnerDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Switch">
              <SwitchDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Table" className="col-span-2">
              <TableDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Tabs">
              <TabsDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Textarea">
              <TextareaDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Toast">
              <ToastDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Toggle">
              <div className="flex items-center gap-2">
                <ToggleDemo />
                <ToggleDisabled />
                <ToggleOutline />
                <ToggleWithText />
              </div>
            </ComponentWrapper>
            <ComponentWrapper name="ToggleGroup">
              <ToggleGroupDemo />
            </ComponentWrapper>
            <ComponentWrapper name="Tooltip">
              <TooltipDemo />
            </ComponentWrapper>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
