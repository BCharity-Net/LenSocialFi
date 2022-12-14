/* eslint-disable react/jsx-key */
import { DocumentNode, useQuery } from '@apollo/client'
import PostsShimmer from '@components/Shared/Shimmer/PublicationsShimmer'
import { Card } from '@components/UI/Card'
import { EmptyState } from '@components/UI/EmptyState'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Profile } from '@generated/types'
import { CollectionIcon } from '@heroicons/react/outline'
import React, { FC, useState } from 'react'
import { useFilters, useTable } from 'react-table'
import { useAppPersistStore } from 'src/store/app'

import PublicationRevenue from './PublicationRevenue'

interface Props {
  profile: Profile
  handleQueryComplete: Function
  getColumns: Function
  query: DocumentNode
  request: any
  tableLimit: number
}

export interface Data {
  name: string
  orgName: string
  funds: number
  goal: string
  date: string
  postID: string
}

const FundraiseTable: FC<Props> = ({
  profile,
  handleQueryComplete,
  getColumns,
  query,
  request,
  tableLimit
}) => {
  const currentUser = useAppPersistStore((state) => state.currentUser)
  const [onEnter, setOnEnter] = useState<boolean>(false)
  const [tableData, setTableData] = useState<Data[]>([])
  const [pubIdData, setPubIdData] = useState<string[]>([])
  const [fundsData, setFundsData] = useState<number[]>([])

  const handleTableData = async (data: any) => {
    return Promise.all(
      data.map(async (i: any, index: number) => {
        return {
          name: i.metadata.name,
          funds: index,
          goal: i.metadata.attributes[1].value,
          vhr: Math.floor(i.metadata.attributes[1].value / 3),
          date: i.createdAt.split('T')[0],
          postID: i.id
        }
      })
    )
  }

  const { data, loading, error, fetchMore } = useQuery(query, {
    variables: {
      request: request,
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    skip: !profile?.id,
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      if (onEnter) {
        tableData.splice(0, tableData.length)
        setTableData(tableData)
        setOnEnter(false)
      }
      const opportunities = handleQueryComplete(data)
      handleTableData(opportunities).then((result: Data[]) => {
        setTableData([...tableData, ...result])
        if (tableData.length != tableLimit) {
          fetchMore({
            variables: {
              offset: tableLimit - tableData.length
            }
          })
        }
      })
      const pubId: string[] = [],
        funds: number[] = []
      opportunities.map((i: any) => {
        pubId.push(i.id)
        funds.push(0)
      })
      setPubIdData([...pubIdData, ...pubId])
      setFundsData([...fundsData, ...funds])
      setOnEnter(true)
    }
  })

  const columns = getColumns()

  const Table = () => {
    const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } =
      useTable(
        {
          columns,
          data: tableData
        },
        useFilters
      )

    return (
      <table
        className="w-full text-md text-center mb-2 mt-2"
        {...getTableProps()}
      >
        <thead>
          {headerGroups.map((headerGroup, index) => {
            return index === 0 ? (
              <tr>
                <th
                  className="p-4"
                  {...headerGroup.headers[0].getHeaderProps()}
                >
                  {headerGroup.headers[0] &&
                    headerGroup.headers[0].render('Header')}
                </th>
              </tr>
            ) : (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th className="p-4" {...column.getHeaderProps()}>
                    {column.render('Header')}
                    <div>
                      {column.canFilter ? column.render('Filter') : null}
                    </div>
                  </th>
                ))}
              </tr>
            )
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row)
            return (
              <>
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td className="p-4" {...cell.getCellProps()}>
                        {cell.render('Cell', { funds: fundsData })}
                      </td>
                    )
                  })}
                </tr>
                <PublicationRevenue
                  pubId={pubIdData[index]}
                  callback={(data: any) => {
                    console.log(fundsData[index], data)
                    if (fundsData[index] != data) {
                      fundsData[index] = data
                      setFundsData(fundsData)
                      setTableData([...tableData])
                    }
                  }}
                />
              </>
            )
          })}
        </tbody>
      </table>
    )
  }

  return (
    <>
      {loading && <PostsShimmer />}
      {data?.publications?.items?.length === 0 && (
        <EmptyState
          message={
            <div>
              <span className="mr-1 font-bold">@{profile?.handle}</span>
              <span>seems like not {'POST'.toLowerCase()}ed yet!</span>
            </div>
          }
          icon={<CollectionIcon className="w-8 h-8 text-brand" />}
        />
      )}
      <ErrorMessage title="Failed to load fundraisers" error={error} />
      {!error && !loading && data?.publications?.items?.length !== 0 && (
        <Card>
          <Table />
        </Card>
      )}
    </>
  )
}

export default FundraiseTable
