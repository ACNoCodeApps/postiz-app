import { HttpStatusCode } from 'axios';
export const dynamic = 'force-dynamic';
import { internalFetch } from '@gitroom/helpers/utils/internal.fetch';
import { redirect } from 'next/navigation';
import { Redirect } from '@gitroom/frontend/components/layout/redirect';
import { getT } from '@gitroom/react/translation/get.translation.service.backend';
export default async function Page({
  params: { provider },
  searchParams,
}: {
  params: {
    provider: string;
  };
  searchParams: any;
}) {
  const t = await getT();
  if (provider === 'x') {
    searchParams = {
      ...searchParams,
      state: searchParams.oauth_token || '',
      code: searchParams.oauth_verifier || '',
      refresh: searchParams.refresh || '',
    };
  }
  if (provider === 'vk') {
    searchParams = {
      ...searchParams,
      state: searchParams.state || '',
      code: searchParams.code + '&&&&' + searchParams.device_id,
    };
  }
  const data = await internalFetch(`/integrations/social/${provider}/connect`, {
    method: 'POST',
    body: JSON.stringify(searchParams),
  });
  if (data.status === HttpStatusCode.NotAcceptable) {
    const { msg } = await data.json();
    return redirect(`/launches?msg=${msg}`);
  }
  if (
    data.status !== HttpStatusCode.Ok &&
    data.status !== HttpStatusCode.Created
  ) {
    return (
      <>
        <div className="mt-[50px] text-[50px]">
          {t('could_not_add_provider', 'Could not add provider.')}
          <br />
          {t('you_are_being_redirected_back', 'You are being redirected back')}
        </div>
        <Redirect url="/launches" delay={3000} />
      </>
    );
  }
  const { inBetweenSteps, id } = await data.json();
  if (inBetweenSteps && !searchParams.refresh) {
    return redirect(`/launches?added=${provider}&continue=${id}`);
  }
  return redirect(`/launches?added=${provider}&msg=Channel Updated`);
}
