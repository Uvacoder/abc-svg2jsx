import { Flex, useToast, Skeleton } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import createJsxTemplate from '../utils/createJsxTemplate';
import Sidebar from './Sidebar';

const Editor = dynamic(import('./Editor'), {
  ssr: false,
  loading: () => <Skeleton flex="1" />,
});

interface ApiResponse {
  success: boolean;
  code: string;
}

const Content = () => {
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  const [checkedItems, setCheckedItems] = React.useState({
    memo: false,
    typescript: false,
    singleQuote: false,
    semi: true,
  });

  const allChecked = Object.values(checkedItems).every(Boolean);
  const isIndeterminate =
    Object.values(checkedItems).some(Boolean) && !allChecked;
  const toast = useToast();

  useEffect(() => {
    const generateJsx = async () => {
      try {
        const { data } = await axios.post<ApiResponse>('/api/svg2jsx', {
          svg: value,
        });

        const FormattedCode = createJsxTemplate(
          {
            code: data.code,
            memo: checkedItems.memo,
            typescript: checkedItems.typescript,
          },
          {
            singleQuote: checkedItems.singleQuote,
            semi: checkedItems.semi,
            jsxSingleQuote: checkedItems.singleQuote,
          }
        );

        setCode(FormattedCode);
      } catch (error) {
        setCode('');
        toast({
          title:
            (typeof error?.response?.data?.message === 'string' &&
              error?.response?.data?.message) ||
            'Error Occurred',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (value.trim().length) {
      setCode('Loading...');
      generateJsx();
    } else {
      setCode('');
    }
  }, [
    value,
    checkedItems.memo,
    checkedItems.typescript,
    checkedItems.semi,
    checkedItems.singleQuote,
  ]);

  return (
    <Flex
      flex="1"
      bg="var(--primary)"
      wrap={['wrap', 'wrap', 'nowrap']}
      overflow="auto"
    >
      <Flex
        flex={['1', '1', '0.5']}
        minW={['300px', '350px', '250px']}
        minH="200px"
        m={2}
        bg="var(--secondary)"
        shadow="md"
      >
        <Sidebar
          {...{
            checkedItems,
            setCheckedItems,
            allChecked,
            isIndeterminate,
          }}
        />
      </Flex>
      <Flex
        flex="1"
        p={2}
        overflowX="auto"
        minW={['300px', '350px', '250px']}
        minH="200px"
      >
        <Editor
          name="svg input"
          type="editor"
          {...{ setValue }}
          defaultValue={value}
        />
      </Flex>
      <Flex
        flex="1"
        p={2}
        overflowX="auto"
        minW={['300px', '350px', '250px']}
        minH="200px"
      >
        <Editor readOnly defaultValue={code} name="jsx output" type="preview" />
      </Flex>
    </Flex>
  );
};

export default Content;
