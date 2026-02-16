import { redirect } from "next/navigation";

export default function OldRoomsRoomRedirect({ params }: { params: { slug: string } }) {
  redirect(`/members/room/${params.slug}`);
}
