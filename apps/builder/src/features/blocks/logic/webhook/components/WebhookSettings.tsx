import { CopyButton } from "@/components/CopyButton";
import { TableList, type TableListItemProps } from "@/components/TableList";
import { TextLink } from "@/components/TextLink";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { DataVariableInputs } from "@/features/blocks/integrations/httpRequest/components/ResponseMappingInputs";
import { computeDeepKeysMappingSuggestionList } from "@/features/blocks/integrations/httpRequest/helpers/computeDeepKeysMappingSuggestionList";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useUser } from "@/features/user/hooks/useUser";
import { toast } from "@/lib/toast";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
} from "@chakra-ui/react";
import * as Sentry from "@sentry/nextjs";
import type { ResponseVariableMapping } from "@typebot.io/blocks-integrations/httpRequest/schema";
import type { WebhookBlock } from "@typebot.io/blocks-logic/webhook/schema";
import { env } from "@typebot.io/env";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import usePartySocket from "partysocket/react";
import { useMemo, useState } from "react";

type Props = {
  blockId: string;
  options: WebhookBlock["options"];
  onOptionsChange: (options: WebhookBlock["options"]) => void;
};

export const WebhookSettings = ({
  blockId,
  options,
  onOptionsChange,
}: Props) => {
  const { typebot, save } = useTypebot();
  const { user } = useUser();
  const [receivedData, setReceivedData] = useState<string>();
  const [websocketStatus, setWebsocketStatus] = useState<"closed" | "opened">(
    "closed",
  );
  const [responseKeys, setResponseKeys] = useState<string[]>();

  const updateResponseVariableMapping = (
    responseVariableMapping: ResponseVariableMapping[],
  ) => onOptionsChange({ ...options, responseVariableMapping });

  const ws = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: `${user?.id}/${typebot?.id}/webhooks`,

    async onMessage(e) {
      try {
        const parsedData = JSON.parse(e.data);
        if (Object.keys(parsedData).length > 0) {
          setReceivedData(JSON.stringify(parsedData, null, 2));
          setResponseKeys(computeDeepKeysMappingSuggestionList(parsedData));
        }
        setWebsocketStatus("closed");
        ws.close();
      } catch (err) {
        toast(await parseUnknownError({ err }));
      }
    },
    async onError(e) {
      console.error(e);
      console.log((await parseUnknownError({ err: e })).details);
      Sentry.captureException(e);
    },
    startClosed: true,
  });

  const listenForTestEvent = async () => {
    await save();
    ws.reconnect();
    setReceivedData(undefined);
    setResponseKeys(undefined);
    setWebsocketStatus("opened");
  };

  const ResponseMappingInputs = useMemo(
    () =>
      function Component(props: TableListItemProps<ResponseVariableMapping>) {
        return <DataVariableInputs {...props} dataItems={responseKeys ?? []} />;
      },
    [responseKeys],
  );

  const urlBase = typebot
    ? `${env.NEXT_PUBLIC_VIEWER_URL[0]}/api/v1/typebots/${typebot.id}/blocks/${blockId}`
    : "";

  return (
    <Tabs size="sm" variant="unstyled">
      <TabList>
        <Tab>Test URL</Tab>
        <Tab>Production URL</Tab>
      </TabList>
      <TabPanels>
        <TabPanel pb="0">
          <Stack spacing="4">
            {typebot && (
              <FormControl as={Stack}>
                <InputGroup size="sm">
                  <Input
                    type={"text"}
                    defaultValue={`${urlBase}/web/executeTestWebhook`}
                  />
                  <InputRightElement width="60px">
                    <CopyButton
                      size="sm"
                      textToCopy={`${urlBase}/web/executeTestWebhook`}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            )}
            <Button
              onClick={listenForTestEvent}
              colorScheme="orange"
              isLoading={websocketStatus === "opened"}
            >
              Listen for test event
            </Button>
            {websocketStatus === "opened" && (
              <Stack borderWidth="1px" p="4" borderRadius="md" spacing="3">
                <Text fontSize="sm">
                  Waiting for an{" "}
                  <TextLink
                    href={
                      "https://docs.typebot.io/api-reference/authentication"
                    }
                    isExternal
                  >
                    authenticated
                  </TextLink>{" "}
                  <Tag>POST</Tag> request to the Test URL...
                </Text>
              </Stack>
            )}
            {receivedData && (
              <CodeEditor isReadOnly lang="json" value={receivedData} />
            )}
            {(receivedData ||
              (options?.responseVariableMapping &&
                options.responseVariableMapping.length > 0)) && (
              <Accordion allowMultiple>
                <AccordionItem>
                  <AccordionButton justifyContent="space-between">
                    Save in variables
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pt="4">
                    <TableList<ResponseVariableMapping>
                      initialItems={options?.responseVariableMapping}
                      onItemsChange={updateResponseVariableMapping}
                      addLabel="Add an entry"
                    >
                      {(props) => <ResponseMappingInputs {...props} />}
                    </TableList>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            )}
          </Stack>
        </TabPanel>
        <TabPanel pb="0">
          {typebot && (
            <FormControl as={Stack}>
              <InputGroup size="sm">
                <Input
                  type={"text"}
                  defaultValue={`${urlBase}/results/{resultId}/executeWebhook`}
                />
                <InputRightElement width="60px">
                  <CopyButton
                    size="sm"
                    textToCopy={`${urlBase}/results/{resultId}/executeWebhook`}
                  />
                </InputRightElement>
              </InputGroup>
              <FormHelperText mt="0">
                You can easily get the Result ID{" "}
                <TextLink
                  isExternal
                  href="https://docs.typebot.io/editor/blocks/logic/set-variable#result-id"
                >
                  with a Set variable block
                </TextLink>
                .
              </FormHelperText>
            </FormControl>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
