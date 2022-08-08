import UserProfile from '@components/Shared/UserProfile'
import { BCharityPublication } from '@generated/bcharitytypes'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import React, { FC } from 'react'

import PostActions from './Actions'
import HiddenPost from './HiddenPublication'
import PublicationBody from './PublicationBody'
import PublicationType from './Type'

dayjs.extend(relativeTime)

interface Props {
  publication: BCharityPublication
  showType?: boolean
  showThread?: boolean
  showActions?: boolean
}

const SinglePost: FC<Props> = ({
  publication,
  showType = true,
  showThread = false,
  showActions = true
}) => {
  const publicationType = publication?.metadata?.attributes[0]?.value

  return (
    <div className="p-5">
      <PublicationType publication={publication} showType={showType} showThread={showThread} />
      <div>
        <div className="flex justify-between pb-4 space-x-1.5">
          <UserProfile
            profile={
              publicationType === 'group' && !!publication?.collectedBy?.defaultProfile
                ? publication?.collectedBy?.defaultProfile
                : publication?.__typename === 'Mirror'
                ? publication?.mirrorOf?.profile
                : publication?.profile
            }
          />
          <Link href={`/posts/${publication?.id ?? publication?.pubId}`}>
            <a
              href={`/posts/${publication?.id ?? publication?.pubId}`}
              className="text-sm text-gray-500"
            >
              {`${dayjs(new Date(publication?.createdAt)).fromNow()}`}
            </a>
          </Link>
        </div>
        <div className="ml-[53px]">
          {publication?.hidden ? (
            <HiddenPost type={publication?.__typename} />
          ) : (
            <>
              <PublicationBody publication={publication} />
              {showActions && <PostActions publication={publication} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SinglePost
