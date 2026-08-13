import { api } from "@/lib/api";
import type { CompanyEvent } from "@/types";

export const eventService = {
  async listUpcoming() {
    const { data } = await api.get<CompanyEvent[]>("/events/upcoming");
    return data;
  },

  async create(title: string, eventDate: string, category: string) {
    const { data } = await api.post<CompanyEvent>("/events", {
      title,
      event_date: eventDate,
      category,
    });
    return data;
  },

  async update(
    eventId: string,
    payload: Partial<Pick<CompanyEvent, "title" | "event_date" | "category">>
  ) {
    const { data } = await api.patch<CompanyEvent>(
      `/events/${eventId}`,
      payload
    );
    return data;
  },

  async delete(eventId: string) {
    await api.delete(`/events/${eventId}`);
  },
};
