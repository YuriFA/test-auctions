/**
 * The fixed identity of the "current user" inside the mock runtime.
 *
 * Every auctionDTO carries `trading.your` flags and every bet record has an
 * `organization_id` / `subscriber_id` owner. The mock dataset marks bets and
 * trading state as belonging to the current user by matching these IDs, which
 * keeps `is_bidder`, `your.bet`, `place`, and `is_win` consistent across the
 * list, detail, and bets endpoints.
 */
export interface MockCurrentUser {
  subscriber_id: number;
  organization_id: number;
  organization_name: string;
  organization_inn: string;
  contact_name: string;
  contact_phone: string;
}

export const mockCurrentUser: MockCurrentUser = {
  subscriber_id: 100,
  organization_id: 1001,
  organization_name: "ООО «ТестЛогистика»",
  organization_inn: "7700000001",
  contact_name: "Иван Петров",
  contact_phone: "+7 900 000-00-01",
};

/**
 * Competing carriers used to populate bets from other participants. Real INNs
 * and stable IDs keep the bets endpoint consistent across mutations.
 */
export interface MockCompetitor {
  subscriber_id: number;
  organization_id: number;
  organization_name: string;
  organization_inn: string;
  contact_name: string;
  contact_phone: string;
}

export const mockCompetitors: MockCompetitor[] = [
  {
    subscriber_id: 201,
    organization_id: 2001,
    organization_name: "ООО «Атлант-Логистик»",
    organization_inn: "7700000002",
    contact_name: "Сергей Смирнов",
    contact_phone: "+7 901 000-00-02",
  },
  {
    subscriber_id: 202,
    organization_id: 2002,
    organization_name: "ООО «ТрансГруз»",
    organization_inn: "7700000003",
    contact_name: "Анна Кузнецова",
    contact_phone: "+7 902 000-00-03",
  },
  {
    subscriber_id: 203,
    organization_id: 2003,
    organization_name: "ООО «БыстроВоз»",
    organization_inn: "7700000004",
    contact_name: "Дмитрий Орлов",
    contact_phone: "+7 903 000-00-04",
  },
  {
    subscriber_id: 204,
    organization_id: 2004,
    organization_name: "ООО «ЕвроПеревозки»",
    organization_inn: "7700000005",
    contact_name: "Мария Васильева",
    contact_phone: "+7 904 000-00-05",
  },
];
