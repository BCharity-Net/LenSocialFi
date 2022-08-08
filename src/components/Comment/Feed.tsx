import { gql, useQuery } from '@apollo/client'
import SinglePublication from '@components/Publication/SinglePublication'
import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer'
import { Card } from '@components/UI/Card'
import { EmptyState } from '@components/UI/EmptyState'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Spinner } from '@components/UI/Spinner'
import { BCharityPublication } from '@generated/bcharitytypes'
import { PaginatedResultInfo } from '@generated/types'
import { CommentFields } from '@gql/CommentFields'
import { CollectionIcon } from '@heroicons/react/outline'
import { Mixpanel } from '@lib/mixpanel'
import React, { FC, useState } from 'react'
import { useInView } from 'react-cool-inview'
import { useTranslation } from 'react-i18next'
import { useAppPersistStore } from 'src/store/app'
import { PAGINATION } from 'src/tracking'

import ReferenceAlert from '../Shared/ReferenceAlert'
import NewComment from './NewComment'

const COMMENT_FEED_QUERY = gql`
  query CommentFeed(
    $request: PublicationsQueryRequest!
    $reactionRequest: ReactionFieldResolverRequest
    $profileId: ProfileId
  ) {
    publications(request: $request) {
      items {
        ... on Comment {
          ...CommentFields
        }
      }
      pageInfo {
        totalCount
        next
      }
    }
  }
  ${CommentFields}
`

interface Props {
  publication: BCharityPublication
  type?: 'comment' | 'group post'
  onlyFollowers?: boolean
  isFollowing?: boolean
}

const Feed: FC<Props> = ({
  publication,
  type = 'comment',
  onlyFollowers = false,
  isFollowing = true
}) => {
  const { t } = useTranslation('common')
  const pubId = publication?.__typename === 'Mirror' ? publication?.mirrorOf?.id : publication?.id
  const currentUser = useAppPersistStore((state) => state.currentUser)
  const [publications, setPublications] = useState<BCharityPublication[]>([])
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const { data, loading, error, fetchMore } = useQuery(COMMENT_FEED_QUERY, {
    variables: {
      request: { commentsOf: pubId, limit: 10 },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    skip: !pubId,
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      setPageInfo(data?.publications?.pageInfo)
      setPublications(data?.publications?.items)
    }
  })

  const { observe } = useInView({
    onEnter: async () => {
      const { data } = await fetchMore({
        variables: {
          request: {
            commentsOf: pubId,
            cursor: pageInfo?.next,
            limit: 10
          },
          reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
          profileId: currentUser?.id ?? null
        }
      })
      setPageInfo(data?.publications?.pageInfo)
      setPublications([...publications, ...data?.publications?.items])
      Mixpanel.track(
        type === 'comment'
          ? PAGINATION.COMMENT_FEED
          : PAGINATION.GROUP_FEED,
        { pageInfo }
      )
    }
  })

  return (
    <>
      {currentUser &&
        (isFollowing || !onlyFollowers ? (
          <NewComment publication={publication} type={type} />
        ) : (
          <ReferenceAlert
            handle={publication?.profile?.handle}
            isSuperFollow={
              publication?.profile?.followModule?.__typename ===
              'FeeFollowModuleSettings'
            }
            action="comment"
          />
        ))}
      {loading && <PublicationsShimmer />}
      {data?.publications?.items?.length === 0 && (
        <EmptyState
          message={<span>{t('First comment')}</span>}
          icon={<CollectionIcon className="w-8 h-8 text-brand" />}
        />
      )}
      <ErrorMessage title="Failed to load comment feed" error={error} />
      {!error && !loading && data?.publications?.items?.length !== 0 && (
        <>
          <Card className="divide-y-[1px] dark:divide-gray-700/80">
            {publications?.map((post: BCharityPublication, index: number) => (
              <SinglePublication
                key={`${pubId}_${index}`}
                publication={post}
                showType={false}
              />
            ))}
          </Card>
          {pageInfo?.next && publications.length !== pageInfo?.totalCount && (
            <span ref={observe} className="flex justify-center p-5">
              <Spinner size="sm" />
            </span>
          )}
        </>
      )}
    </>
  )
}

export default Feed
