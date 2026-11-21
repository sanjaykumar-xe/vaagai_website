import { useLang } from '../../i18n/LanguageContext'

export default function AnnouncementBar() {
  const { t } = useLang()
  return <div className="bg-burgundy px-4 py-2 text-center text-[0.8125rem] text-white">{t('announce')}</div>
}
