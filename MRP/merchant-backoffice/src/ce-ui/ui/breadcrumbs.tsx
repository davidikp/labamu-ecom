"use client";

import { ChevronLeft } from "lucide-react";
import { useLocale } from "../locale";
import { toTestId } from "../lib/utils";

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export interface BreadcrumbItem {
    name: string;
    customLink?: string;
    onClick?: () => void;
}

export interface BreadcrumbsProps {
    title: string;
    titleOnBreadcrumb?: string;
    breadcrumbs: BreadcrumbItem[];
    dateRange?: { from?: Date; to?: Date };
    onBack?: () => void;
    onBreadcrumbClick?: (item: BreadcrumbItem, index: number) => void;
    /** Called when a breadcrumb with `customLink` is clicked. Defaults to `window.location.assign`. Use this to wire in your router (e.g. Next.js `router.push`, React Router `navigate`). */
    onNavigate?: (url: string) => void;
    showBackButton?: boolean;
    className?: string;
    testId?: string;
}

const Breadcrumbs = ({
    title,
    titleOnBreadcrumb,
    breadcrumbs,
    dateRange,
    onBack,
    onBreadcrumbClick,
    onNavigate,
    showBackButton = true,
    className = "",
    testId,
}: BreadcrumbsProps) => {
    const locale = useLocale();

    const goBack = () => {
        if (onBack) {
            onBack();
            return;
        }
        window.history.back();
    };

    const handleBreadcrumbAction = (item: BreadcrumbItem, index: number) => {
        if (item.onClick) {
            item.onClick();
            return;
        }
        if (onBreadcrumbClick) {
            onBreadcrumbClick(item, index);
            return;
        }
        if (item.customLink) {
            onNavigate ? onNavigate(item.customLink) : window.location.assign(item.customLink);
            return;
        }
        goBack();
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`.trim()} data-testid={toTestId(testId, "breadcrumbs")}>
            <div className="flex items-center gap-2">
                {showBackButton ? (
                    <div
                        className="flex cursor-pointer flex-row items-center gap-2"
                        onClick={goBack}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                goBack();
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-400" />
                        <span className="text-[26px] font-bold">{title}</span>
                    </div>
                ) : (
                    <span className="text-[26px] font-bold">{title}</span>
                )}
                {dateRange && (
                    <p className="p-1 text-sm">
                        {dateRange.from && dateRange.to ? (
                            <>
                                {formatDate(dateRange.from.toISOString())} -{" "}
                                {formatDate(dateRange.to.toISOString())}
                            </>
                        ) : (
                            locale.breadcrumbs.allPeriod
                        )}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-1 text-[14px] font-[400] text-[#A9A9A9]">
                {breadcrumbs.map((breadcrumb, index) => (
                    <span
                        key={`${breadcrumb.name}-${index}`}
                        className="flex cursor-pointer items-center"
                        onClick={() => handleBreadcrumbAction(breadcrumb, index)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                handleBreadcrumbAction(breadcrumb, index);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        {breadcrumb.name}
                        {index < breadcrumbs.length - 1 && <span className="mx-1"> / </span>}
                    </span>
                ))}
                <span> / {titleOnBreadcrumb || title}</span>
            </div>
        </div>
    );
};

export default Breadcrumbs;
