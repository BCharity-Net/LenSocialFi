import { BCharityPublication } from '@generated/bcharitytypes'
import { useRouter } from 'next/router'
import React, { FC } from 'react'

import Collected from './Collected'
import Commented from './Commented'
import CommentedPublication from './CommentedPublication'
import GroupPost from './GroupPost'
import Mirrored from './Mirrored'

interface Props {
  publication: BCharityPublication
  showType?: boolean
  showThread?: boolean
}

const PostType: FC<Props> = ({ publication, showType, showThread }) => {
  const { pathname } = useRouter()
  const type = publication?.__typename
  const publicationType = publication?.metadata?.attributes[0]?.value
  const isCollected = !!publication?.collectedBy

  if (!showType) return null

  return (
    <>
      {type === 'Mirror' && <Mirrored publication={publication} />}
      {type === 'Comment' &&
        pathname === '/posts/[id]' &&
        publicationType !== 'group post' && (
          <CommentedPublication publication={publication} />
        )}
      {type === 'Comment' &&
        !showThread &&
        !isCollected &&
        publicationType !== 'group post' && <Commented publication={publication} />}
      {publicationType === 'group post' &&
        pathname !== '/groups/[id]' &&
        type !== 'Mirror' && <GroupPost publication={publication} />}
      {isCollected && publicationType !== 'group' && publicationType !== 'fundraise' && (
        <Collected publication={publication} type="Collected" />
      )}
      {isCollected && publicationType === 'fundraise' && (
        <Collected publication={publication} type="Funded" />
      )}
    </>
  )
}

export default PostType
