import { BCharityPublication } from '@generated/bcharitytypes'
import React, { FC } from 'react'

import Collect from './Collect'
import Comment from './Comment'
import Like from './Like'
import PostMenu from './Menu'
import Mirror from './Mirror'

interface Props {
  publication: BCharityPublication
}

const PublicationActions: FC<Props> = ({ publication }) => {
  const publicationType = publication?.metadata?.attributes[0]?.value

  return publicationType !== 'group' ? (
    <div className="flex gap-8 items-center pt-3 -ml-2 text-gray-500">
      <Comment publication={publication} />
      <Mirror publication={publication} />
      <Like publication={publication} />
      {publication?.collectModule?.__typename !== 'RevertCollectModuleSettings' &&
        publicationType !== 'fundraise' &&
        publicationType !== 'fundraise-comment' &&
        publicationType !== 'hours' && <Collect publication={publication} />}
      <PostMenu publication={publication} />
    </div>
  ) : null
}

export default PublicationActions
