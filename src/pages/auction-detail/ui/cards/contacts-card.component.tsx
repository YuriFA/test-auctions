import type { AuctionDetailVM, AuctionRestrictions } from '@entities/auction'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui'
import { Phone } from 'lucide-react'

export interface ContactsCardProps {
  vm: AuctionDetailVM
  restrictions: AuctionRestrictions
}

export function ContactsCard({ vm, restrictions }: ContactsCardProps) {
  // NOTE: hide_points_address_and_contacts also hides organizer-level contacts,
  // not just point addresses — derive the meaning in one place.
  if (!restrictions.canViewContacts) {
    return null
  }
  if (vm.contacts.length === 0) {
    return null
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Phone className="size-4 text-muted-foreground" aria-hidden />
          Контакты
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3 text-sm">
          {vm.contacts.map((contact, idx) => (
            <li key={contact.uid || idx} className="flex flex-col gap-0.5">
              {contact.name && <div className="font-medium">{contact.name}</div>}
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground">
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="hover:text-foreground">
                    {contact.phone}
                  </a>
                )}
                {contact.workPhone && (
                  <a href={`tel:${contact.workPhone}`} className="hover:text-foreground">
                    {contact.workPhone}
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="hover:text-foreground">
                    {contact.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
