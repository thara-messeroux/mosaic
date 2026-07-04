import type { Member } from '../data/members'
import { Icon } from './Icon'
import { ImageWithFallback } from './ImageWithFallback'
import { ConnectionLens } from './ConnectionLens'
import { SectionLabel, Chip } from './Primitives'

// Read-only presentation of a member. Used on Discover and Profile detail.
export function ProfileCard({ member }: { member: Member }) {
  return (
    <article className="profile-card">
      <div className="profile-photo">
        <ImageWithFallback src={member.photo} alt={`Portrait of ${member.firstName}`} />
      </div>

      <div className="profile-body">
        <div>
          <div className="profile-identity">
            <h2 className="profile-name">{member.firstName}</h2>
            <span className="profile-age">{member.age}</span>
          </div>
          <div className="profile-meta">
            <span>
              <Icon name="map-pin" size={16} />
              {member.city}, {member.country}
            </span>
            <span>
              <Icon name="globe" size={16} />
              Originally from {member.originallyFrom}
            </span>
          </div>
        </div>

        <div className="tag-row">
          <span className="tag tag-accent">
            <Icon name="heart" size={14} />
            {member.intent}
          </span>
          <span className="tag tag-soft">
            <Icon name="waves" size={14} />
            {member.connectionStyle}
          </span>
        </div>

        <div>
          <SectionLabel>Values</SectionLabel>
          <div className="chip-wrap">
            {member.values.map((value) => (
              <Chip key={value}>{value}</Chip>
            ))}
          </div>
        </div>

        <div className="prompt-box">
          <p className="prompt-q">{member.prompt.question}</p>
          <p className="prompt-a">“{member.prompt.answer}”</p>
        </div>

        <ConnectionLens copy={member.lens} />
      </div>
    </article>
  )
}
