export interface IdeaModel{
    id: number,
    date: string,
    title: string,
    description: string,
    author: string,
    author_pic: string,
    votes_up: number,
    votes_down: number,
    comments: number,
    campaign_id: number,
    location: string,
    location_id: number,
    resourceSpaceId: number
}