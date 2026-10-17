import { computed, type ComputedRef } from "vue";
import {
  columns as rawColumns,
  events as rawEvents,
  startHour,
  endHour,
  slotMinutes,
  EVENT_COLORS,
  type TimetableEvent,
} from "~/data/scheduleData";
import { normalizeHexColor, getContrastColor } from "~/utils/color";

export interface ScheduleColumnView {
  key: string;
  label: string;
  min: string;
  grow: number | undefined;
  color: string | undefined;
}

export interface ScheduleTimeLabel {
  key: string;
  text: string;
  col: number;
  row: number;
  isHalf: boolean;
}

export interface ScheduleEventView extends TimetableEvent {
  index: number;
  columnIndex: number;
  startRow: number;
  rowSpan: number;
  isCompact: boolean;
  titleText: string;
  detailText: string;
  formattedTitle: string;
  backgroundColor: string;
  textColor: string;
  fontSize: string;
  duration: string;
  area: string;
}

export type ScheduleGridStyles = {
  "--columns": string;
  "--rows": string;
  "--content-start": string;
  "--content-end": string;
};

export interface ScheduleModel {
  columns: ComputedRef<ScheduleColumnView[]>;
  timeLabels: ComputedRef<ScheduleTimeLabel[]>;
  processedEvents: ComputedRef<ScheduleEventView[]>;
  gridStyles: ComputedRef<ScheduleGridStyles>;
}

export function useScheduleModel(): ScheduleModel {
  const { t, locale } = useI18n();
  const columns = computed<ScheduleColumnView[]>(() => {
    const isEn = locale.value.startsWith("en");
    return rawColumns.map((col) => ({
      key: col.key,
      label: col.label ? (isEn ? col.label.en : col.label.zh) : "",
      min: col.min,
      grow: col.grow,
      color: col.color,
    }));
  });

  function formatHourLabel(hour: number) {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const timeLabels = computed<ScheduleTimeLabel[]>(() => {
    const labels: ScheduleTimeLabel[] = [];
    const rightTimeColumn = rawColumns.length;

    for (let h = startHour; h < endHour; h++) {
      const hourMinutes = h * 60;
      const startMinutes = startHour * 60;
      const hourRow =
        2 + Math.round((hourMinutes - startMinutes) / slotMinutes);

      labels.push({
        key: `hour-${h}`,
        text: formatHourLabel(h),
        col: 1,
        row: hourRow,
        isHalf: false,
      });

      const halfHour = h + 0.5;
      if (halfHour < endHour) {
        const halfMinutes = halfHour * 60;
        const halfRow =
          2 + Math.round((halfMinutes - startMinutes) / slotMinutes);

        labels.push({
          key: `half-${h}`,
          text: formatHourLabel(halfHour),
          col: rightTimeColumn,
          row: halfRow,
          isHalf: true,
        });
      }
    }
    return labels;
  });

  function timeToMinutes(time: string) {
    const [h = 0, m = 0] = String(time).split(":").map(Number);
    return h * 60 + m;
  }

  function timeToSlotIndex(time: string) {
    const startMinutes = startHour * 60;
    return Math.round((timeToMinutes(time) - startMinutes) / slotMinutes);
  }

  function timeToGridRowStart(time: string) {
    return 2 + timeToSlotIndex(time);
  }

  function timeSpanSlots(start: string, end: string) {
    return Math.max(1, timeToSlotIndex(end) - timeToSlotIndex(start));
  }

  function getColumnIndex(trackKey: string) {
    const index = rawColumns.findIndex((col) => col.key === trackKey);
    return index >= 0 ? index + 1 : 2;
  }

  function getDynamicFontSize(rowSpan: number) {
    if (rowSpan <= 2) return "0.72rem";
    if (rowSpan <= 4) return "0.84rem";
    if (rowSpan <= 6) return "0.94rem";
    return "inherit";
  }

  const processedEvents = computed<ScheduleEventView[]>(() => {
    const isEn = locale.value.startsWith("en");
    return rawEvents.map((event, index) => {
      const columnIndex = getColumnIndex(event.track);
      const startRow = timeToGridRowStart(event.start);
      const rowSpan = timeSpanSlots(event.start, event.end);
      const isCompact = rowSpan <= 5;

      const rawColor = EVENT_COLORS[event.type];
      const eventColor = normalizeHexColor(rawColor);
      const textColor = getContrastColor(eventColor);
      const fontSize = getDynamicFontSize(rowSpan);
      const titleText = isEn ? event.title.en : event.title.zh;
      const detailText = event.detail
        ? isEn
          ? event.detail.en
          : event.detail.zh
        : "";
      const formattedTitle = titleText.replace(/\n/g, "<br>");

      const diffMinutes = timeToMinutes(event.end) - timeToMinutes(event.start);
      const hrs = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      let duration = "";
      if (hrs > 0 && mins > 0) {
        duration = t("schedule.durationHoursMinutes", {
          hours: hrs,
          minutes: mins,
        });
      } else if (hrs > 0) {
        duration = t("schedule.durationHours", { hours: hrs });
      } else {
        duration = t("schedule.durationMinutes", { minutes: mins });
      }

      const matchingCol = rawColumns.find((col) => col.key === event.track);
      const areaLabel = matchingCol?.label
        ? isEn
          ? matchingCol.label.en
          : matchingCol.label.zh
        : matchingCol?.key || "";

      return {
        ...event,
        index,
        titleText,
        detailText,
        formattedTitle,
        columnIndex,
        startRow,
        rowSpan,
        isCompact,
        backgroundColor: eventColor,
        textColor,
        fontSize,
        duration,
        area: areaLabel,
      };
    });
  });

  const gridStyles = computed<ScheduleGridStyles>(() => {
    const slotsPerHour = 60 / slotMinutes;
    const totalHours = endHour - startHour;
    const totalSlots = Math.round(totalHours * slotsPerHour);

    const gridColumns = rawColumns
      .map((col) => {
        const min = col.min || "8em";
        if (col.key === "time-left" || col.key === "time-right") {
          return min;
        }
        return `minmax(${min}, ${col.grow || 1}fr)`;
      })
      .join(" ");

    const contentStart = 2;
    const contentEnd = rawColumns.length;

    return {
      "--columns": gridColumns,
      "--rows": `4em repeat(${totalSlots}, var(--slot-h))`,
      "--content-start": String(contentStart),
      "--content-end": String(contentEnd),
    };
  });

  return { columns, timeLabels, processedEvents, gridStyles };
}
