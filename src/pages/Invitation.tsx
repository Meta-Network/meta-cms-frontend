import { useIntl, useRequest } from 'umi';
import { CopyOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { List, Badge, Card, Divider, notification } from 'antd';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import FormattedDescription from '@/components/FormattedDescription';
import { queryInvitations, updateInvitation } from '@/services/api/meta-ucenter';

export default () => {
  const intl = useIntl();
  const { data, loading } = useRequest(() => queryInvitations());
  const list = data || [];

  return (
    <PageContainer
      breadcrumb={{}}
      title={intl.formatMessage({ id: 'messages.invitation.title' })}
      content={<FormattedDescription id="messages.invitation.description" />}
    >
      <List
        rowKey="id"
        loading={loading}
        grid={{
          gutter: 30,
          column: 2,
        }}
        dataSource={list}
        renderItem={(item) => {
          const isUnused: boolean = item.invitee_user_id === 0;

          return (
            <List.Item key={item.id}>
              <Badge.Ribbon
                text={
                  isUnused
                    ? intl.formatMessage({ id: 'component.badge.invitationAvailable' })
                    : intl.formatMessage({ id: 'component.badge.invitationUsed' })
                }
                color={isUnused ? 'green' : 'blue'}
              >
                <Card
                  title={intl.formatMessage(
                    { id: 'messages.invitation.card.title' },
                    { codeId: item.id },
                  )}
                  hoverable
                  bordered={false}
                  style={{ marginTop: 16 }}
                >
                  <ProForm
                    initialValues={{
                      sub: item.sub,
                      message: item.message,
                    }}
                    labelAlign="left"
                    layout="vertical"
                    onFinish={async (values) => {
                      const body = {
                        sub: values.sub,
                        message: values.message,
                      } as GLOBAL.InvitationInfo;
                      const result = await updateInvitation(item.signature, body);
                      if (result.message === 'ok') {
                        notification.success({
                          message: intl.formatMessage({ id: 'messages.info.updateSuccess' }),
                        });
                      } else {
                        notification.error({
                          message: intl.formatMessage({ id: 'messages.info.updateFailed' }),
                          description: result.message,
                        });
                      }
                    }}
                  >
                    <ProFormText
                      fieldProps={{
                        id: `signature_${item.id}`,
                        readOnly: true,
                        suffix: isUnused ? (
                          <a
                            onClick={() => {
                              const sigArea = document.querySelector(
                                `#signature_${item.id}`,
                              ) as HTMLInputElement;
                              sigArea?.select();
                              document.execCommand('copy');
                              notification.success({
                                message: intl.formatMessage({ id: 'messages.info.copySuccess' }),
                              });
                            }}
                          >
                            <CopyOutlined />
                          </a>
                        ) : (
                          <CopyOutlined />
                        ),
                      }}
                      initialValue={item.signature}
                      label={intl.formatMessage({ id: 'messages.invitation.cardLabel' })}
                      width="md"
                      name="signature"
                      disabled={!isUnused}
                    />
                    <Divider />
                    <p>{intl.formatMessage({ id: 'messages.invitation.editInfoHere' })}</p>
                    <ProFormText
                      fieldProps={{ id: `sub_${item.id}` }}
                      label={intl.formatMessage({ id: 'messages.invitation.inviteeLabel' })}
                      width="md"
                      name="sub"
                      placeholder={intl.formatMessage({ id: 'messages.invitation.inviteeName' })}
                    />
                    <ProFormText
                      fieldProps={{ id: `${item.id}_message` }}
                      label={intl.formatMessage({ id: 'messages.invitation.inviteInfo' })}
                      width="md"
                      name="message"
                      placeholder={intl.formatMessage({
                        id: 'messages.invitation.messageToInvitee',
                      })}
                    />
                  </ProForm>
                </Card>
              </Badge.Ribbon>
            </List.Item>
          );
        }}
      />
    </PageContainer>
  );
};
