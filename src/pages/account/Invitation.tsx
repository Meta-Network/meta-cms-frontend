import { PageContainer } from '@ant-design/pro-layout';
import { List, Badge, Card, Divider, notification, Button } from 'antd';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useRequest } from '@@/plugin-request/request';
import { queryInvitations, updateInvitation } from '@/services/api/ucenter';

export default () => {
  const { data, loading } = useRequest(() => {
    return queryInvitations({
      count: 8,
    });
  });
  const list = data || [];
  const content = (
    <div>
      <p>在这里管理你拥有的邀请码。</p>
      <p>你可以在下方编辑邀请信息，定制发送后对方会接受的信息。</p>
    </div>
  );
  return (
    <PageContainer breadcrumb={{}} title="邀请码管理" content={content}>
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
                text={isUnused ? '邀请码可用' : '邀请码已使用'}
                color={isUnused ? 'green' : 'blue'}
              >
                <Card
                  title={`邀请码 #${item.id}`}
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
                    layout="horizontal"
                    labelCol={{ span: 4 }}
                    onFinish={async (values) => {
                      const body = {
                        sub: values.sub,
                        message: values.message,
                      } as API.InvitationInfo;
                      const result = await updateInvitation(item.signature, body);
                      if (result.message === 'ok') {
                        notification.success({
                          message: '信息更新完成',
                        });
                      } else {
                        notification.error({
                          message: '信息更新失败',
                          description: result.message,
                        });
                      }
                    }}
                  >
                    <ProFormText
                      fieldProps={{ id: `signature_${item.id}`, readOnly: true }}
                      initialValue={item.signature}
                      label="邀请代码"
                      width="md"
                      name="signature"
                      disabled={!isUnused}
                    />
                    <Button
                      onClick={() => {
                        const sigArea = document.querySelector(
                          `#signature_${item.id}`,
                        ) as HTMLInputElement;
                        sigArea?.select();
                        document.execCommand('copy');
                        notification.success({ message: '复制成功' });
                      }}
                      type="primary"
                      disabled={!isUnused}
                    >
                      复制
                    </Button>
                    <Divider />
                    <p>可以在此处编辑信息</p>
                    <ProFormText
                      fieldProps={{ id: `sub_${item.id}` }}
                      label="受邀人"
                      width="md"
                      name="sub"
                      placeholder="受邀人的称呼"
                    />
                    <ProFormText
                      fieldProps={{ id: `${item.id}_message` }}
                      label="邀请信息"
                      width="md"
                      name="message"
                      placeholder="一段写给对方的话"
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
